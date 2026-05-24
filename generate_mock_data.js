const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.utils.book_new();

// 1. Users
const usersData = [
  { UserID: 'U1001', Name: 'John Doe', Email: 'john@example.com', Role: 'admin', Status: 'Active' },
  { UserID: 'U1002', Name: 'Jane Smith', Email: 'jane@example.com', Role: 'manager', Status: 'Active' },
  { UserID: 'U1003', Name: 'Mike Johnson', Email: 'mike@example.com', Role: 'agent', Status: 'Active' },
];
const usersSheet = xlsx.utils.json_to_sheet(usersData);
xlsx.utils.book_append_sheet(workbook, usersSheet, 'Users');

// 2. Lead Sources
const sourcesData = [
  { SourceID: 'S001', Name: 'Website Organic', Cost: 0, LeadsGenerated: 120 },
  { SourceID: 'S002', Name: 'Google Ads', Cost: 500, LeadsGenerated: 45 },
  { SourceID: 'S003', Name: 'Referral', Cost: 0, LeadsGenerated: 10 },
];
const sourcesSheet = xlsx.utils.json_to_sheet(sourcesData);
xlsx.utils.book_append_sheet(workbook, sourcesSheet, 'LeadSources');

// 3. Customers
const customersData = [
  { CustomerID: 'C5001', Name: 'Acme Corp', ContactName: 'Alice Brown', Email: 'alice@acme.com', Phone: '555-0101', Status: 'Active', AssignedTo: 'U1002' },
  { CustomerID: 'C5002', Name: 'Globex Inc', ContactName: 'Bob White', Email: 'bob@globex.com', Phone: '555-0202', Status: 'Inactive', AssignedTo: 'U1003' },
  { CustomerID: 'C5003', Name: 'Initech', ContactName: 'Charlie Green', Email: 'charlie@initech.com', Phone: '555-0303', Status: 'Active', AssignedTo: 'U1002' },
];
const customersSheet = xlsx.utils.json_to_sheet(customersData);
xlsx.utils.book_append_sheet(workbook, customersSheet, 'Customers');

// 4. Products & Services
const productsData = [
  { ProductID: 'P001', Name: 'Basic CRM Subscription', Category: 'Software', Price: 29.99, Status: 'Active' },
  { ProductID: 'P002', Name: 'Pro CRM Subscription', Category: 'Software', Price: 99.99, Status: 'Active' },
  { ProductID: 'P003', Name: 'Consulting Hour', Category: 'Service', Price: 150.00, Status: 'Active' },
];
const productsSheet = xlsx.utils.json_to_sheet(productsData);
xlsx.utils.book_append_sheet(workbook, productsSheet, 'Products');

// 5. Leads
const leadsData = [
  { LeadID: 'L2001', Title: 'Acme Upgrade', Status: 'Negotiation', Value: 5000, ExpectedClose: '2026-06-15', CustomerID: 'C5001', AssignedTo: 'U1002', SourceID: 'S001', ProductInterest: 'P002' },
  { LeadID: 'L2002', Title: 'New Prospect - Stark Ind', Status: 'New', Value: 12000, ExpectedClose: '2026-07-01', CustomerID: '', AssignedTo: 'U1003', SourceID: 'S002', ProductInterest: 'P002' },
  { LeadID: 'L2003', Title: 'Initech Consulting', Status: 'Closed Won', Value: 1500, ExpectedClose: '2026-05-10', CustomerID: 'C5003', AssignedTo: 'U1002', SourceID: 'S003', ProductInterest: 'P003' },
];
const leadsSheet = xlsx.utils.json_to_sheet(leadsData);
xlsx.utils.book_append_sheet(workbook, leadsSheet, 'Leads');

// 6. Activities
const activitiesData = [
  { ActivityID: 'A3001', Type: 'Call', Description: 'Initial discovery call', Date: '2026-05-01', LeadID: 'L2002', PerformedBy: 'U1003' },
  { ActivityID: 'A3002', Type: 'Email', Description: 'Sent proposal for upgrade', Date: '2026-05-03', LeadID: 'L2001', PerformedBy: 'U1002' },
  { ActivityID: 'A3003', Type: 'Meeting', Description: 'Kickoff meeting', Date: '2026-05-12', LeadID: 'L2003', PerformedBy: 'U1002' },
];
const activitiesSheet = xlsx.utils.json_to_sheet(activitiesData);
xlsx.utils.book_append_sheet(workbook, activitiesSheet, 'Activities');

// 7. Tasks
const tasksData = [
  { TaskID: 'T4001', Title: 'Follow up on proposal', Description: 'Call Alice regarding the new contract', Status: 'Pending', DueDate: '2026-05-05', AssignedTo: 'U1002', RelatedLeadID: 'L2001' },
  { TaskID: 'T4002', Title: 'Prepare Presentation', Description: 'Stark Industries product demo', Status: 'In Progress', DueDate: '2026-05-10', AssignedTo: 'U1003', RelatedLeadID: 'L2002' },
  { TaskID: 'T4003', Title: 'Send Invoice', Description: 'Initech consulting invoice', Status: 'Completed', DueDate: '2026-05-04', AssignedTo: 'U1002', RelatedLeadID: 'L2003' },
];
const tasksSheet = xlsx.utils.json_to_sheet(tasksData);
xlsx.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');

// 8. Payments
const paymentsData = [
  { PaymentID: 'PAY1001', CustomerID: 'C5003', Amount: 1500, Date: '2026-05-15', Status: 'Pending', InvoiceNumber: 'INV-2026-001' },
  { PaymentID: 'PAY1002', CustomerID: 'C5001', Amount: 29.99, Date: '2026-05-01', Status: 'Completed', InvoiceNumber: 'INV-2026-002' },
];
const paymentsSheet = xlsx.utils.json_to_sheet(paymentsData);
xlsx.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');

// 9. Email Templates
const templatesData = [
  { TemplateID: 'TPL001', Name: 'Welcome Email', Subject: 'Welcome to TasksFlow!', CreatedBy: 'U1001' },
  { TemplateID: 'TPL002', Name: 'Proposal Follow-up', Subject: 'Checking in on our proposal', CreatedBy: 'U1002' },
];
const templatesSheet = xlsx.utils.json_to_sheet(templatesData);
xlsx.utils.book_append_sheet(workbook, templatesSheet, 'EmailTemplates');

// 10. Email Triggers
const triggersData = [
  { TriggerID: 'TRG001', Name: 'Send Welcome on Lead Creation', Event: 'LeadCreated', TemplateID: 'TPL001', Status: 'Active' },
  { TriggerID: 'TRG002', Name: 'Follow-up after 3 days', Event: 'ProposalSent', TemplateID: 'TPL002', Status: 'Inactive' },
];
const triggersSheet = xlsx.utils.json_to_sheet(triggersData);
xlsx.utils.book_append_sheet(workbook, triggersSheet, 'EmailTriggers');

// Save to file
const outputPath = 'CRM_Mock_Data.xlsx';
xlsx.writeFile(workbook, outputPath);
console.log('Mock data generated at ' + outputPath);
