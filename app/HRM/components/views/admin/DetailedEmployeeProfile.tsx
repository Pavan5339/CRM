'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  CURRENT_STAGE_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  EMPLOYMENT_LIFECYCLE_STATUS_OPTIONS,
  formatEmploymentValue,
  getEmployeeTypeLabel,
} from '@/utils/hrm-employment';

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'others', label: 'Others' },
];
const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Buddhist', 'Jain', 'Parsi', 'Other'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const PROBATION_PERIOD_OPTIONS = ['90', '180'];
const NOTICE_PERIOD_OPTIONS = ['30', '60', '90'];
const DOCUMENT_TYPES = [
  { key: 'aadhaar_card', label: 'Aadhaar Card' },
  { key: 'pan_card', label: 'PAN Card' },
  { key: 'passport', label: 'Passport' },
  { key: 'appointment_letter', label: 'Appointment Letter (Previous Organisation)' },
  { key: 'experience_letter', label: 'Experience Letter' },
  { key: 'salary_slip', label: 'Salary Slip' },
];

const defaultForm = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  personalEmail: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  fatherName: '',
  maritalStatus: '',
  spouseName: '',
  nationality: '',
  religion: '',
  isPhysicallyChallenged: 'No',
  address: '',
  city: '',
  district: '',
  state: '',
  country: '',
  pincode: '',
  permanentAddress: '',
  permanentCity: '',
  permanentDistrict: '',
  permanentState: '',
  permanentCountry: '',
  permanentPincode: '',
  phone2: '',
  mobile: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  joinedOn: '',
  confirmationDate: '',
  employeeType: 'full_time_employee',
  lifecycleStatus: 'active',
  currentStage: 'none',
  probationPeriodDays: '',
  noticePeriodDays: '',
  referredBy: '',
  currentCompanyExperience: '',
  salary: '',
  previousExperience: '',
  totalExperience: '',
  department: '',
  division: '',
  designation: '',
  reportingTo: '',
  company: '',
  workingScheduleLabel: '',
  secondSaturdayOff: 'No',
  taskManagerAccess: 'No',
  aadhaarNumber: '',
  panNumber: '',
  passportNumber: '',
  bankAccountNumber: '',
  bankAccountHolderName: '',
  bankIfscCode: '',
  bankName: '',
};

const CURRENT_TO_PERMANENT_FIELD_MAP: Record<string, keyof typeof defaultForm> = {
  address: 'permanentAddress',
  city: 'permanentCity',
  district: 'permanentDistrict',
  state: 'permanentState',
  country: 'permanentCountry',
  pincode: 'permanentPincode',
};

function buildPermanentAddressPatch(form: typeof defaultForm) {
  return {
    permanentAddress: form.address,
    permanentCity: form.city,
    permanentDistrict: form.district,
    permanentState: form.state,
    permanentCountry: form.country,
    permanentPincode: form.pincode,
  };
}

function isPermanentAddressSameAsCurrent(form: typeof defaultForm) {
  return (
    form.address === form.permanentAddress &&
    form.city === form.permanentCity &&
    form.district === form.permanentDistrict &&
    form.state === form.permanentState &&
    form.country === form.permanentCountry &&
    form.pincode === form.permanentPincode
  );
}

function toInputDate(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function toDisplayDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatStatus(status?: string | null) {
  return formatEmploymentValue(status);
}

function normalizeGender(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['male', 'female', 'others'].includes(normalized)) {
    return normalized;
  }

  return '';
}

function getInitials(name?: string | null) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'E';
}

function statusTone(status?: string | null) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (normalized === 'inactive') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (normalized === 'terminated') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-surface-container-low text-on-surface-variant border-outline-variant/10';
}

function stageTone(stage?: string | null) {
  const normalized = String(stage || '').toLowerCase();
  if (normalized === 'probation') return 'bg-violet-50 text-violet-700 border-violet-200';
  if (normalized === 'on_leave') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (normalized === 'notice_period') return 'bg-sky-50 text-sky-700 border-sky-200';
  return 'bg-surface-container-low text-on-surface-variant border-outline-variant/10';
}

function toYesNo(value?: boolean | string | null) {
  return value ? 'Yes' : 'No';
}

function pickFirstText(...values: Array<string | number | null | undefined>) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }

  return '';
}

function formatDocumentLabel(value?: string | null) {
  const normalized = String(value || '').trim();
  if (!normalized) return 'Employee Document';
  if (normalized === 'appointment_letter') return 'Appointment Letter (Previous Organisation)';

  return normalized
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatFileSize(value?: number | null) {
  if (!value || value <= 0) return 'Size unavailable';

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocumentIcon(documentType?: string | null, fileName?: string | null) {
  const normalizedType = String(documentType || '').toLowerCase();
  const extension = String(fileName || '').split('.').pop()?.toLowerCase();

  if (normalizedType.includes('aadhaar') || normalizedType.includes('pan') || normalizedType.includes('passport')) {
    return 'badge';
  }

  if (normalizedType.includes('salary')) {
    return 'receipt_long';
  }

  if (normalizedType.includes('letter')) {
    return 'description';
  }

  if (extension === 'pdf') return 'picture_as_pdf';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) return 'image';

  return 'folder_open';
}

function formatReportingTarget(employee: any) {
  return employee?.reporting_manager_name || 'Not assigned';
}

function formatEducationLevelLabel(value?: string | null) {
  const normalized = String(value || '').trim();
  if (!normalized) return 'Education Record';
  if (normalized === '10th' || normalized === '12th') return normalized;

  return normalized
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeEmployeeToForm(employee: any) {
  const access = Array.isArray(employee?.module_access) ? employee.module_access[0] : employee?.module_access;

  return {
    employeeId: employee?.employee_id || '',
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    personalEmail: employee?.personal_email || '',
    dateOfBirth: toInputDate(employee?.date_of_birth),
    gender: normalizeGender(employee?.gender),
    bloodGroup: employee?.blood_group || '',
    fatherName: employee?.father_name || '',
    maritalStatus: employee?.marital_status || '',
    spouseName: employee?.spouse_name || '',
    nationality: employee?.nationality || '',
    religion: employee?.religion || '',
    isPhysicallyChallenged: toYesNo(employee?.is_physically_challenged),
    address: employee?.address || '',
    city: employee?.city || '',
    district: employee?.district || '',
    state: employee?.state || '',
    country: employee?.country || '',
    pincode: employee?.pincode || '',
    permanentAddress: employee?.permanent_address || '',
    permanentCity: employee?.permanent_city || '',
    permanentDistrict: employee?.permanent_district || '',
    permanentState: employee?.permanent_state || '',
    permanentCountry: employee?.permanent_country || '',
    permanentPincode: employee?.permanent_pincode || '',
    phone2: employee?.alternate_phone || '',
    mobile: employee?.mobile_phone || '',
    emergencyContactName: employee?.emergency_contact_name || '',
    emergencyContactNumber: employee?.emergency_contact_number || '',
    joinedOn: toInputDate(employee?.date_of_joining),
    confirmationDate: toInputDate(employee?.confirmation_date),
    employeeType: employee?.resolved_employee_type || employee?.employee_type || 'full_time_employee',
    lifecycleStatus: employee?.resolved_employment_lifecycle_status || employee?.employment_lifecycle_status || 'active',
    currentStage: employee?.resolved_current_stage || employee?.current_stage || 'none',
    probationPeriodDays: employee?.probation_period_days ? String(employee.probation_period_days) : '',
    noticePeriodDays: employee?.notice_period_days ? String(employee.notice_period_days) : '',
    referredBy: employee?.referred_by || '',
    currentCompanyExperience: employee?.current_company_experience || '',
    salary: employee?.salary !== undefined && employee?.salary !== null ? String(employee.salary) : '',
    previousExperience: employee?.previous_experience || '',
    totalExperience: employee?.total_experience || '',
    department: employee?.department?.name || employee?.resolved_department_name || '',
    division: employee?.division || '',
    designation: employee?.designation?.title || employee?.resolved_designation_title || '',
    reportingTo: employee?.reporting_manager_value || '',
    company: employee?.company || '',
    workingScheduleLabel: employee?.working_schedule_label || '',
    secondSaturdayOff: toYesNo(employee?.second_saturday_off),
    taskManagerAccess: access?.task_manager ? 'Yes' : 'No',
    aadhaarNumber: employee?.aadhaar_number || '',
    panNumber: employee?.pan_number || '',
    passportNumber: employee?.passport_number || '',
    bankAccountNumber: employee?.bank_account_number || '',
    bankAccountHolderName: employee?.bank_account_holder_name || '',
    bankIfscCode: employee?.bank_ifsc || '',
    bankName: employee?.bank_name || '',
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function inputClassName(disabled = false, multiline = false) {
  return `w-full rounded-2xl border border-outline-variant/15 bg-white px-4 py-3 text-sm text-on-surface outline-none transition ${
    multiline ? 'min-h-[120px] resize-y' : ''
  } ${
    disabled
      ? 'cursor-default bg-surface-container-low text-on-surface-variant'
      : 'focus:border-primary focus:ring-2 focus:ring-primary/10'
  }`;
}

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function DetailedEmployeeProfile({
  employeeId,
  setCurrentTab,
  embedded = false,
  onBack,
}: {
  employeeId?: string | null;
  setCurrentTab?: (tab: string) => void;
  embedded?: boolean;
  onBack?: () => void;
}) {
  const [employee, setEmployee] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [meta, setMeta] = useState<any>({ employees: [], departments: [], designations: [] });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});
  const [activeDocumentType, setActiveDocumentType] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('personal');
  const [pendingStatusAction, setPendingStatusAction] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEmployee() {
      if (!employeeId) {
        setEmployee(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        setMessage('');

        const response = await fetch(`/HRM/api/employees?id=${employeeId}&includeMeta=1`, {
          method: 'GET',
          cache: 'no-store',
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load employee');
        }

        if (!active) return;

        const nextForm = normalizeEmployeeToForm(result.employee || {});
        setEmployee(result.employee || null);
        setForm(nextForm);
        setSameAsCurrentAddress(isPermanentAddressSameAsCurrent(nextForm));
        setMeta({
          employees: result.employeeOptions || result.employees || [],
          superAdmins: result.superAdminOptions || [],
          departments: result.departments || [],
          designations: result.designations || [],
        });
      } catch (requestError: any) {
        if (active) {
          setEmployee(null);
          setError(requestError?.message || 'Failed to load employee');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEmployee();
    return () => {
      active = false;
    };
  }, [employeeId]);

  useEffect(() => {
    if (!message) return;
    setFeedbackModal({ type: 'success', text: message });
  }, [message]);

  useEffect(() => {
    if (!error) return;
    setFeedbackModal({ type: 'error', text: error });
  }, [error]);

  const reportingManagerOptions = useMemo(() => {
    return (meta.employees || []).filter((item: any) => item.id !== employee?.id);
  }, [employee?.id, meta.employees]);

  const superAdminOptions = useMemo(() => meta.superAdmins || [], [meta.superAdmins]);

  const filteredDesignations = useMemo(() => {
    const selectedDepartment = (meta.departments || []).find((item: any) => item.name === form.department);
    if (!selectedDepartment?.id) {
      return meta.designations || [];
    }

    return (meta.designations || []).filter(
      (item: any) => !item.department_id || item.department_id === selectedDepartment.id
    );
  }, [form.department, meta.departments, meta.designations]);

  const documentList = useMemo(() => {
    if (!Array.isArray(employee?.documents)) return [];

    return [...employee.documents].sort((left: any, right: any) => {
      const leftTime = new Date(left?.updated_at || left?.created_at || 0).getTime();
      const rightTime = new Date(right?.updated_at || right?.created_at || 0).getTime();
      return rightTime - leftTime;
    });
  }, [employee?.documents]);

  const documentSummary = useMemo(() => {
    const totalSize = documentList.reduce((sum: number, item: any) => sum + (Number(item?.file_size) || 0), 0);
    const latestDocument = documentList[0];

    return {
      totalDocuments: documentList.length,
      totalSizeLabel: formatFileSize(totalSize),
      latestUpdatedLabel: latestDocument ? toDisplayDate(latestDocument.updated_at || latestDocument.created_at) : '--',
    };
  }, [documentList]);

  const documentSlots = useMemo(() => {
    const byType = new Map<string, any>();
    for (const item of documentList) {
      if (!byType.has(item.document_type)) {
        byType.set(item.document_type, item);
      }
    }

    return DOCUMENT_TYPES.map((documentType) => ({
      ...documentType,
      document: byType.get(documentType.key) || null,
      selectedFile: documentFiles[documentType.key] || null,
    }));
  }, [documentFiles, documentList]);

  const summaryItems = useMemo(
    () => [
      { label: 'Employee Type', value: getEmployeeTypeLabel(employee?.resolved_employee_type || employee?.employee_type) },
      { label: 'Lifecycle Status', value: formatStatus(employee?.resolved_employment_lifecycle_status || employee?.employment_lifecycle_status) },
      { label: 'Current Stage', value: formatStatus(employee?.resolved_current_stage || employee?.current_stage) },
      { label: 'Department', value: employee?.resolved_department_name || employee?.department?.name || '--' },
      { label: 'Designation', value: employee?.resolved_designation_title || employee?.designation?.title || '--' },
      { label: 'Reporting To', value: formatReportingTarget(employee) },
      { label: 'Created By', value: employee?.created_by_name || 'HR Admin' },
      { label: 'Date Of Joining', value: toDisplayDate(employee?.date_of_joining) },
      { label: 'Salary', value: employee?.salary !== null && employee?.salary !== undefined ? `INR ${employee.salary}` : '--' },
      { label: 'Task Manager', value: form.taskManagerAccess === 'Yes' ? 'Enabled' : 'Disabled' },
    ],
    [employee, form.taskManagerAccess]
  );

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(sameAsCurrentAddress && CURRENT_TO_PERMANENT_FIELD_MAP[name]
        ? { [CURRENT_TO_PERMANENT_FIELD_MAP[name]]: value }
        : {}),
      ...(name === 'lifecycleStatus' && value === 'terminated' ? { currentStage: 'none' } : {}),
    }));
    setMessage('');
    setError('');
  }

  function handleSameAsCurrentAddressChange(checked: boolean) {
    setSameAsCurrentAddress(checked);
    if (!checked) return;

    setForm((current) => ({
      ...current,
      ...buildPermanentAddressPatch(current),
    }));
  }

  async function handleSave() {
    if (!employee?.id) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch('/HRM/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          ...form,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update employee');
      }

      const nextEmployee = result.employee || employee;
      const nextForm = normalizeEmployeeToForm(nextEmployee);
      setEmployee(nextEmployee);
      setForm(nextForm);
      setSameAsCurrentAddress(isPermanentAddressSameAsCurrent(nextForm));
      setIsEditing(false);
      setMessage('Employee details updated successfully.');
    } catch (requestError: any) {
      setError(requestError?.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  }

  async function applyStatusUpdate(nextStatus: string) {
    if (!employee?.id) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch('/HRM/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          lifecycleStatus: nextStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update employee status');
      }

      setEmployee(result.employee || employee);
      setForm((current) => ({
        ...current,
        lifecycleStatus: nextStatus,
        ...(nextStatus === 'terminated' ? { currentStage: 'none' } : {}),
      }));
      setMessage(`Employee marked as ${formatStatus(nextStatus)}.`);
    } catch (requestError: any) {
      setError(requestError?.message || 'Failed to update employee status');
    } finally {
      setSaving(false);
      setPendingStatusAction(null);
    }
  }

  function handleStatusUpdate(nextStatus: string) {
    if (!employee?.id || saving) return;
    setPendingStatusAction(nextStatus);
  }

  async function handleDelete() {
    if (!employee?.id) return;
    const confirmed = window.confirm('Delete this employee record permanently?');
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch(`/HRM/api/employees?id=${employee.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete employee');
      }

      setCurrentTab?.('admin-employee-list');
    } catch (requestError: any) {
      setError(requestError?.message || 'Failed to delete employee');
    } finally {
      setSaving(false);
    }
  }

  function handleDocumentFileChange(documentType: string, file: File | null) {
    setDocumentFiles((current) => ({
      ...current,
      [documentType]: file,
    }));
    setMessage('');
    setError('');
  }

  async function handleDocumentUpload(documentType: string) {
    if (!employee?.id) return;

    const file = documentFiles[documentType];
    if (!file) {
      setError('Select a file before uploading.');
      return;
    }

    try {
      setActiveDocumentType(documentType);
      setError('');
      setMessage('');

      const payload = new FormData();
      payload.append('id', employee.id);
      payload.append(`document_${documentType}`, file);

      const response = await fetch('/HRM/api/employees', {
        method: 'PATCH',
        body: payload,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document');
      }

      const nextEmployee = result.employee || employee;
      setEmployee(nextEmployee);
      setDocumentFiles((current) => ({
        ...current,
        [documentType]: null,
      }));
      setMessage(result.message || 'Document uploaded successfully.');
    } catch (requestError: any) {
      setError(requestError?.message || 'Failed to upload document');
    } finally {
      setActiveDocumentType(null);
    }
  }

  async function handleDocumentDelete(documentType: string) {
    if (!employee?.id) return;

    const confirmed = window.confirm('Delete this document? This will remove it from storage and the database.');
    if (!confirmed) return;

    try {
      setActiveDocumentType(documentType);
      setError('');
      setMessage('');

      const response = await fetch(
        `/HRM/api/employees?id=${employee.id}&documentType=${encodeURIComponent(documentType)}`,
        { method: 'DELETE' }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete document');
      }

      setEmployee(result.employee || employee);
      setDocumentFiles((current) => ({
        ...current,
        [documentType]: null,
      }));
      setMessage(result.message || 'Document deleted successfully.');
    } catch (requestError: any) {
      setError(requestError?.message || 'Failed to delete document');
    } finally {
      setActiveDocumentType(null);
    }
  }

  function renderPersonalSection() {
    return (
      <SectionShell
        title="Personal Details"
        subtitle="Core personal, contact, and residential information for this employee."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Field label="Full Name">
            <input name="name" value={form.name} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Official Email">
            <input name="email" value={form.email} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Phone Number">
            <input name="phone" value={form.phone} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Personal Email">
            <input name="personalEmail" value={form.personalEmail} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Date Of Birth">
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Gender">
            <select name="gender" value={form.gender} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Blood Group">
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select blood group</option>
              {BLOOD_GROUP_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Father's Name">
            <input name="fatherName" value={form.fatherName} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Marital Status">
            <input name="maritalStatus" value={form.maritalStatus} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Spouse Name">
            <input name="spouseName" value={form.spouseName} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Nationality">
            <input name="nationality" value={form.nationality} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Religion">
            <select name="religion" value={form.religion} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select religion</option>
              {RELIGION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Physically Challenged">
            <select name="isPhysicallyChallenged" value={form.isPhysicallyChallenged} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              {YES_NO_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Alternate Phone">
            <input name="phone2" value={form.phone2} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Mobile">
            <input name="mobile" value={form.mobile} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Emergency Contact Name">
            <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Emergency Contact Number">
            <input name="emergencyContactNumber" value={form.emergencyContactNumber} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <div className="md:col-span-2 xl:col-span-3 mt-2">
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-5 py-5">
              <p className="text-sm font-bold text-on-surface">Current Address</p>
              <p className="mt-1 text-xs text-on-surface-variant">Primary address used for present communication.</p>
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="md:col-span-2 xl:col-span-3">
                  <Field label="Address">
                    <textarea name="address" value={form.address} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing, true)} />
                  </Field>
                </div>
                <Field label="City">
                  <input name="city" value={form.city} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
                </Field>
                <Field label="District">
                  <input name="district" value={form.district} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
                </Field>
                <Field label="State">
                  <input name="state" value={form.state} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
                </Field>
                <Field label="Country">
                  <input name="country" value={form.country} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
                </Field>
                <Field label="Pincode">
                  <input name="pincode" value={form.pincode} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
                </Field>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Permanent Address</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Permanent residential address kept on the employee record.</p>
                </div>
                <label className={`inline-flex items-center gap-3 rounded-full border border-outline-variant/15 bg-white px-4 py-2 text-sm font-semibold text-on-surface ${!isEditing ? 'opacity-60' : ''}`}>
                  <input
                    type="checkbox"
                    checked={sameAsCurrentAddress}
                    onChange={(event) => handleSameAsCurrentAddressChange(event.target.checked)}
                    disabled={!isEditing}
                  />
                  Same as current address
                </label>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="md:col-span-2 xl:col-span-3">
                  <Field label="Address">
                    <textarea
                      name="permanentAddress"
                      value={form.permanentAddress}
                      onChange={handleChange}
                      disabled={!isEditing || sameAsCurrentAddress}
                      className={inputClassName(!isEditing || sameAsCurrentAddress, true)}
                    />
                  </Field>
                </div>
                <Field label="City">
                  <input name="permanentCity" value={form.permanentCity} onChange={handleChange} disabled={!isEditing || sameAsCurrentAddress} className={inputClassName(!isEditing || sameAsCurrentAddress)} />
                </Field>
                <Field label="District">
                  <input name="permanentDistrict" value={form.permanentDistrict} onChange={handleChange} disabled={!isEditing || sameAsCurrentAddress} className={inputClassName(!isEditing || sameAsCurrentAddress)} />
                </Field>
                <Field label="State">
                  <input name="permanentState" value={form.permanentState} onChange={handleChange} disabled={!isEditing || sameAsCurrentAddress} className={inputClassName(!isEditing || sameAsCurrentAddress)} />
                </Field>
                <Field label="Country">
                  <input name="permanentCountry" value={form.permanentCountry} onChange={handleChange} disabled={!isEditing || sameAsCurrentAddress} className={inputClassName(!isEditing || sameAsCurrentAddress)} />
                </Field>
                <Field label="Pincode">
                  <input name="permanentPincode" value={form.permanentPincode} onChange={handleChange} disabled={!isEditing || sameAsCurrentAddress} className={inputClassName(!isEditing || sameAsCurrentAddress)} />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  function renderProfessionalSection() {
    return (
      <SectionShell
        title="Professional Details"
        subtitle="Position, reporting, schedule, and employment lifecycle information."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Field label="Employee ID">
            <input name="employeeId" value={form.employeeId} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Employee Type">
            <select name="employeeType" value={form.employeeType} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              {EMPLOYEE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Lifecycle Status">
            <select name="lifecycleStatus" value={form.lifecycleStatus} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              {EMPLOYMENT_LIFECYCLE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Current Stage">
            <select name="currentStage" value={form.currentStage} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              {CURRENT_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Date Of Joining">
            <input type="date" name="joinedOn" value={form.joinedOn} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Confirmation Date">
            <input type="date" name="confirmationDate" value={form.confirmationDate} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Probation Period (days)">
            <select name="probationPeriodDays" value={form.probationPeriodDays} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select probation period</option>
              {PROBATION_PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} days</option>
              ))}
            </select>
          </Field>
          <Field label="Notice Period (days)">
            <select name="noticePeriodDays" value={form.noticePeriodDays} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select notice period</option>
              {NOTICE_PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} days</option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <select name="department" value={form.department} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select department</option>
              {(meta.departments || []).map((item: any) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Division">
            <input name="division" value={form.division} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Designation">
            <select name="designation" value={form.designation} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Select designation</option>
              {filteredDesignations.map((item: any) => (
                <option key={item.id} value={item.title}>{item.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Reporting To">
            <select name="reportingTo" value={form.reportingTo} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              <option value="">Manager not assigned</option>
              {superAdminOptions.length > 0 ? (
                <optgroup label="Super Admins">
                  {superAdminOptions.map((item: any) => (
                    <option key={`super-${item.id}`} value={`super_admin:${item.id}`}>
                      {item.name} {item.email ? `(${item.email})` : ''}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              <optgroup label="Employees">
                {reportingManagerOptions.map((item: any) => (
                  <option key={item.id} value={`employee:${item.id}`}>
                    {item.name} {item.employee_id ? `(${item.employee_id})` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Field label="Company">
            <input name="company" value={form.company} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Salary">
            <input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Referred By">
            <input name="referredBy" value={form.referredBy} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Company Experience">
            <input name="currentCompanyExperience" value={form.currentCompanyExperience} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Previous Experience">
            <input name="previousExperience" value={form.previousExperience} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Total Experience">
            <input name="totalExperience" value={form.totalExperience} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Working Schedule">
            <input name="workingScheduleLabel" value={form.workingScheduleLabel} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Second Saturday Off">
            <select name="secondSaturdayOff" value={form.secondSaturdayOff} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              {YES_NO_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Task Manager Access">
            <select name="taskManagerAccess" value={form.taskManagerAccess} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)}>
              {YES_NO_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
        </div>
      </SectionShell>
    );
  }

  function renderIdentityFinanceSection() {
    return (
      <SectionShell
        title="Identity & Finance"
        subtitle="Compliance and bank details used for payroll and employee verification."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Field label="Aadhaar Number">
            <input name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="PAN Number">
            <input name="panNumber" value={form.panNumber} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Passport Number">
            <input name="passportNumber" value={form.passportNumber} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Bank Account Number">
            <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Account Holder Name">
            <input name="bankAccountHolderName" value={form.bankAccountHolderName} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="IFSC Code">
            <input name="bankIfscCode" value={form.bankIfscCode} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
          <Field label="Bank Name">
            <input name="bankName" value={form.bankName} onChange={handleChange} disabled={!isEditing} className={inputClassName(!isEditing)} />
          </Field>
        </div>
      </SectionShell>
    );
  }

  function renderEducationSection() {
    const educationRows = Array.isArray(employee?.education) ? employee.education : [];

    return (
      <SectionShell
        title="Educational Details"
        subtitle="Academic qualifications and educational records saved for this employee."
      >
        {educationRows.length === 0 ? (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-6 py-10 text-center text-sm text-on-surface-variant">
            No educational details have been added for this employee yet.
          </div>
        ) : (
          <div className="space-y-4">
            {educationRows.map((entry: any, index: number) => (
              <div
                key={entry.id || `${entry.education_level || 'education'}-${index}`}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      {formatEducationLevelLabel(entry.education_level)}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-on-surface">
                      {entry.institution_name || 'Institution not provided'}
                    </h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {entry.board_university || 'Board / University not provided'}
                    </p>
                  </div>

                  {entry.file_url ? (
                    <a
                      href={entry.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      View File
                    </a>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Specialization</p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">{entry.specialization || '--'}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Passing Year</p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">{entry.passing_year || '--'}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Score</p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">{entry.score || '--'}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">Updated</p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {toDisplayDate(entry.updated_at || entry.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>
    );
  }

  function renderDocumentsSection() {
    return (
      <SectionShell
        title="Documents"
        subtitle="Keep each employee document in a simple card and replace files when needed."
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {documentSlots.map((slot) => {
              const item = slot.document;
              const isBusy = activeDocumentType === slot.key;
              const hasDocument = Boolean(item);

              return (
                <div
                  key={slot.key}
                  className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-[24px]">
                          {getDocumentIcon(slot.key, item?.file_name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface">{slot.label}</p>
                        <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${hasDocument ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {hasDocument ? 'Available' : 'Missing'}
                        </p>
                        <p className="mt-2 truncate text-xs text-on-surface-variant">
                          {hasDocument ? item?.file_name || 'Uploaded file' : 'Upload a file for this document slot.'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-semibold text-on-surface-variant">
                        {hasDocument ? formatFileSize(item.file_size) : '--'}
                      </p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">
                        {hasDocument ? toDisplayDate(item.updated_at || item.created_at) : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <label className="flex min-w-0 max-w-[260px] cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-on-surface">
                      <span className="truncate">
                        {slot.selectedFile?.name || (hasDocument ? 'Choose new file to replace' : 'Choose file to upload')}
                      </span>
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => handleDocumentFileChange(slot.key, event.target.files?.[0] || null)}
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {hasDocument ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          View
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDocumentUpload(slot.key)}
                        disabled={isBusy || !slot.selectedFile}
                        className="rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? 'Updating...' : hasDocument ? 'Update' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </SectionShell>
    );
  }

  const sections = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'professional', label: 'Professional Details' },
    { id: 'education', label: 'Educational Details' },
    { id: 'identity', label: 'Identity & Finance' },
    { id: 'documents', label: 'Documents' },
  ];
  const activeSectionIndex = Math.max(
    sections.findIndex((section) => section.id === activeSection),
    0
  );

  let mainSection = renderPersonalSection();
  if (activeSection === 'professional') mainSection = renderProfessionalSection();
  if (activeSection === 'education') mainSection = renderEducationSection();
  if (activeSection === 'identity') mainSection = renderIdentityFinanceSection();
  if (activeSection === 'documents') mainSection = renderDocumentsSection();

  if (loading) {
    return (
      <div className={`${embedded ? 'w-full' : 'p-10 w-full'}`}>
        <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-8 py-20 text-center text-on-surface-variant shadow-sm">
          Loading employee profile...
        </div>
      </div>
    );
  }

  if (!employeeId || !employee) {
    return (
      <div className={`${embedded ? 'w-full' : 'p-10 w-full'}`}>
        <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-8 py-20 text-center shadow-sm">
          <p className="text-2xl font-bold text-on-surface">Select an employee from the directory</p>
          <p className="mt-3 text-on-surface-variant">The detailed HR profile will open here for view, edit, status change, and record management.</p>
          {embedded ? null : (
            <button
              type="button"
              onClick={() => setCurrentTab?.('admin-employee-list')}
              className="mt-8 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary"
            >
              Back to Employee Directory
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? 'w-full space-y-6' : 'p-10 pb-14 w-full space-y-8'}`}>
      <section className="rounded-[1.6rem] border border-outline-variant/10 bg-surface-container-lowest px-7 py-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="shrink-0">
              {employee.profile_picture_url ? (
                <Image src={employee.profile_picture_url} alt={employee.name || 'Employee'} width={156} height={156} className="h-[136px] w-[136px] rounded-[1.35rem] object-cover border border-slate-300 shadow-[0_10px_24px_rgba(15,23,42,0.08)]" unoptimized />
              ) : (
                <div className="flex h-[136px] w-[136px] items-center justify-center rounded-[1.35rem] border border-slate-300 bg-primary text-4xl font-extrabold text-on-primary shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                  {getInitials(employee.name)}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  {(employee.resolved_current_stage || employee.current_stage) && (employee.resolved_current_stage || employee.current_stage) !== 'none' ? (
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stageTone(employee.resolved_current_stage || employee.current_stage)}`}>
                      {formatStatus(employee.resolved_current_stage || employee.current_stage)}
                    </span>
                  ) : null}
                </div>
                <h1 className="text-[1.75rem] font-extrabold tracking-tight text-on-surface md:text-[1.9rem]">
                  {employee.name || 'Employee'}
                  <span className="ml-3 inline-flex align-middle rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    {employee.employee_id || '--'}
                  </span>
                </h1>
              </div>
              <div className="space-y-2.5">
                <p className="text-lg font-semibold text-primary">
                  {employee.resolved_designation_title || employee.designation?.title || 'Designation not set'}
                  <span className="mx-2 text-on-surface-variant/40">|</span>
                  {employee.resolved_department_name || employee.department?.name || 'Department not set'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">call</span>{employee.resolved_phone_number || employee.phone || employee.mobile_phone || '--'}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">mail</span>{employee.email || '--'}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">account_tree</span>{formatReportingTarget(employee)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">location_on</span>{[employee.city, employee.state].filter(Boolean).join(', ') || '--'}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(employee.resolved_employment_lifecycle_status || employee.employment_lifecycle_status)}`}>
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {formatStatus(employee.resolved_employment_lifecycle_status || employee.employment_lifecycle_status)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">Created by <span className="font-semibold text-on-surface">{employee.created_by_name || 'HR Admin'}</span><span className="mx-2">•</span>Last updated {toDisplayDate(employee.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-auto xl:ml-auto">
            <div className="flex flex-col items-stretch gap-1.5 xl:min-w-[148px]">
              {embedded ? (
                <button type="button" onClick={() => onBack?.()} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50">
                  <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                  Back
                </button>
              ) : (
                <button type="button" onClick={() => setCurrentTab?.('admin-employee-list')} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50">
                  <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                  Directory
                </button>
              )}
              {isEditing ? (
                <>
                  <button type="button" onClick={() => {
                    const nextForm = normalizeEmployeeToForm(employee);
                    setForm(nextForm);
                    setSameAsCurrentAddress(isPermanentAddressSameAsCurrent(nextForm));
                    setIsEditing(false);
                    setError('');
                    setMessage('');
                  }} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50">
                  <span className="material-symbols-outlined text-[14px]">edit_square</span>
                  Edit Employee
                </button>
              )}
              <button type="button" onClick={() => handleStatusUpdate('inactive')} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50 disabled:opacity-60">
                <span className="material-symbols-outlined text-[14px]">pause_circle</span>
                Mark Inactive
              </button>
              <button type="button" onClick={() => handleStatusUpdate('terminated')} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-black bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-slate-50 disabled:opacity-60">
                <span className="material-symbols-outlined text-[14px]">block</span>
                Terminate
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto">
        <div
          className="relative inline-grid min-w-[900px] rounded-full bg-surface-container-low/70 p-1"
          style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}
        >
          <div
            className="absolute inset-y-1 rounded-full bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out"
            style={{
              width: `calc(${100 / sections.length}% - 0.4rem)`,
              transform: `translateX(calc(${activeSectionIndex * 100}% + ${activeSectionIndex * (0.4 / sections.length)}rem + 0.2rem))`,
            }}
          />
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`relative z-10 whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeSection === section.id ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {pendingStatusAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[1.75rem] border border-outline-variant/10 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                pendingStatusAction === 'terminated' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <span className="material-symbols-outlined text-[22px]">
                  {pendingStatusAction === 'terminated' ? 'warning' : 'pause_circle'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Confirm Status Change</p>
                <h3 className="mt-2 text-xl font-bold text-on-surface">
                  Mark this employee as {formatStatus(pendingStatusAction)}?
                </h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Please confirm again before we update the employee lifecycle status. This action will immediately change the employee record.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingStatusAction(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => applyStatusUpdate(pendingStatusAction)}
                disabled={saving}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  pendingStatusAction === 'terminated'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {saving ? 'Updating...' : `Yes, mark as ${formatStatus(pendingStatusAction)}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {feedbackModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                feedbackModal.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {feedbackModal.type === 'success' ? 'check_circle' : 'error'}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-on-surface">
                  {feedbackModal.type === 'success' ? 'Updated Successfully' : 'Update Failed'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{feedbackModal.text}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setFeedbackModal(null);
                  setMessage('');
                  setError('');
                }}
                className="rounded-md border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
        <div>{mainSection}</div>
        <aside className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm xl:sticky xl:top-8">
          <h2 className="text-2xl font-bold text-on-surface">Employee Details</h2>
          <div className="mt-6 space-y-5">
            {summaryItems.map((item) => (
              <div key={item.label} className="border-b border-outline-variant/10 pb-4 last:border-b-0 last:pb-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-on-surface">{item.value || '--'}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
