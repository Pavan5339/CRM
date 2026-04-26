import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 10,
    opacity: 0.9,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748b',
    marginBottom: 8,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  label: {
    color: '#475569',
  },
  value: {
    fontWeight: 700,
    textAlign: 'right',
  },
  totalCard: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 14,
  },
  footer: {
    marginTop: 16,
    fontSize: 9,
    color: '#64748b',
  },
});

function money(value: any) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export default function PayrollPdfDocument({ snapshot }: { snapshot: any }) {
  const employee = snapshot?.employee || {};
  const meta = snapshot?.meta || {};
  const earnings = snapshot?.earnings || {};
  const deductions = snapshot?.deductions || {};
  const totals = snapshot?.totals || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{employee.company || 'Company'} Payslip</Text>
          <Text style={styles.headerText}>
            {meta.monthLabel || ''} | Payslip No. {snapshot?.payslipNumber || '--'}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Employee</Text>
            <View style={styles.row}><Text style={styles.label}>Employee ID</Text><Text style={styles.value}>{employee.employee_id || '--'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Employee Name</Text><Text style={styles.value}>{employee.name || '--'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Designation</Text><Text style={styles.value}>{employee.designation_title || '--'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Joining Date</Text><Text style={styles.value}>{employee.date_of_joining || '--'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Department</Text><Text style={styles.value}>{employee.department_name || '--'}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payroll</Text>
            <View style={styles.row}><Text style={styles.label}>Base Salary</Text><Text style={styles.value}>{money(earnings.salarySnapshot)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Prorated Salary</Text><Text style={styles.value}>{money(earnings.proratedSalary)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Active Days</Text><Text style={styles.value}>{String(meta.activeDays ?? '--')}</Text></View>
            <View style={styles.row}><Text style={styles.label}>LOP Days</Text><Text style={styles.value}>{String(meta.lopDays ?? '--')}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Payment Status</Text><Text style={styles.value}>{String(meta.paymentStatus || '--')}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Deductions</Text>
            <View style={styles.row}><Text style={styles.label}>LOP</Text><Text style={styles.value}>{money(deductions.lopDeduction)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Employee PF</Text><Text style={styles.value}>{money(deductions.pfEmployeeDeduction)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Employee TDS</Text><Text style={styles.value}>{money(deductions.tdsEmployeeDeduction)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Employer TDS</Text><Text style={styles.value}>{money(deductions.tdsEmployerDeduction)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Total TDS</Text><Text style={styles.value}>{money(deductions.totalTdsDeduction)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Retention</Text><Text style={styles.value}>{money(deductions.retentionDeduction)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Total Deductions</Text><Text style={styles.value}>{money(totals.totalDeductions)}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Release Details</Text>
            <View style={styles.row}><Text style={styles.label}>Retention Release</Text><Text style={styles.value}>{money(deductions.retentionReleaseAmount)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Bank</Text><Text style={styles.value}>{employee.bank_name || '--'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>IFSC</Text><Text style={styles.value}>{employee.bank_ifsc || '--'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Generated</Text><Text style={styles.value}>{meta.generatedAt || '--'}</Text></View>
          </View>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Net Salary</Text>
            <Text style={styles.value}>{money(totals.netSalary)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This payslip is generated from the frozen payroll snapshot and should match the paid payroll record exactly.
        </Text>
      </Page>
    </Document>
  );
}
