// Chart of accounts for a Pakistani sheet-metal / laser-cutting business. Codes never change once used:
// new accounts are added, names can be improved. "class" groups accounts on the balance sheet and P&L.
export const accountGroups = [
  {
    "code": "1000",
    "name": "Cash & Bank",
    "type": "Asset",
    "children": [
      {
        "code": "1001",
        "name": "Cash in Hand",
        "description": "Cash kept at the workshop or office."
      },
      {
        "code": "1002",
        "name": "Business Bank Account",
        "description": "Main business current account."
      },
      {
        "code": "1003",
        "name": "Petty Cash",
        "description": "Float for small day-to-day expenses."
      },
      {
        "code": "1004",
        "name": "Second Bank Account",
        "description": "Another bank account, e.g. a different bank or a savings account."
      },
      {
        "code": "1005",
        "name": "Cheques in Hand / Undeposited",
        "description": "Customer cheques received but not yet cleared."
      }
    ],
    "class": "Current assets"
  },
  {
    "code": "1100",
    "name": "Receivables & Advances",
    "type": "Asset",
    "children": [
      {
        "code": "1101",
        "name": "Customer Receivables",
        "description": "Unpaid customer invoices (trade debtors)."
      },
      {
        "code": "1102",
        "name": "Staff Advances",
        "description": "Salary advances and loans to staff, recovered through payroll."
      },
      {
        "code": "1103",
        "name": "Advance Income Tax (WHT Deducted by Customers)",
        "description": "Income tax withheld by customers (e.g. u/s 153); adjustable against your tax liability."
      },
      {
        "code": "1104",
        "name": "Advances to Suppliers",
        "description": "Payments made to suppliers before the material is received."
      },
      {
        "code": "1105",
        "name": "Prepaid Expenses",
        "description": "Rent, insurance or subscriptions paid in advance."
      },
      {
        "code": "1106",
        "name": "Security Deposits",
        "description": "Refundable deposits for premises, electricity meter, gas cylinders, etc."
      },
      {
        "code": "1107",
        "name": "Sales Tax Refundable",
        "description": "Excess input sales tax carried forward or claimed as a refund."
      }
    ],
    "class": "Current assets"
  },
  {
    "code": "1200",
    "name": "Inventory / Materials",
    "type": "Asset",
    "children": [
      {
        "code": "1201",
        "name": "Raw Material - Mild Steel",
        "description": "MS / HR / CR sheets and plates held in stock."
      },
      {
        "code": "1202",
        "name": "Raw Material - Stainless Steel",
        "description": "SS sheets held in stock."
      },
      {
        "code": "1203",
        "name": "Raw Material - Aluminium",
        "description": "Aluminium sheets held in stock."
      },
      {
        "code": "1204",
        "name": "Work in Progress",
        "description": "Cost of jobs started but not finished (if tracked)."
      },
      {
        "code": "1205",
        "name": "Finished Goods",
        "description": "Cut parts made for stock and not yet sold."
      },
      {
        "code": "1206",
        "name": "Raw Material - Galvanized Steel",
        "description": "GI sheets held in stock."
      }
    ],
    "class": "Current assets"
  },
  {
    "code": "1300",
    "name": "Fixed Assets",
    "type": "Asset",
    "children": [
      {
        "code": "1301",
        "name": "CNC Laser Machine",
        "description": "Cost of the laser cutting machine(s)."
      },
      {
        "code": "1302",
        "name": "Air Compressor"
      },
      {
        "code": "1303",
        "name": "Chiller"
      },
      {
        "code": "1304",
        "name": "Gas System",
        "description": "Gas manifold, regulators and piping."
      },
      {
        "code": "1305",
        "name": "Material Handling Equipment",
        "description": "Cranes, trolleys, forklifts."
      },
      {
        "code": "1306",
        "name": "Computers / CAD Workstations"
      },
      {
        "code": "1307",
        "name": "Workshop Tools"
      },
      {
        "code": "1308",
        "name": "Furniture & Fixtures"
      },
      {
        "code": "1309",
        "name": "Vehicles",
        "description": "Delivery vehicles and cars owned by the business."
      },
      {
        "code": "1310",
        "name": "Generator / UPS / Electrical Installation",
        "description": "Generator, stabilisers, UPS and electrical works."
      },
      {
        "code": "1311",
        "name": "Leasehold Improvements",
        "description": "Civil and electrical work on rented premises."
      },
      {
        "code": "1312",
        "name": "Capital Work in Progress",
        "description": "Assets being installed and not yet in use."
      }
    ],
    "class": "Non-current assets"
  },
  {
    "code": "1400",
    "name": "Accumulated Depreciation",
    "type": "Contra asset",
    "children": [
      {
        "code": "1401",
        "name": "Accumulated Depreciation - Laser Machine"
      },
      {
        "code": "1402",
        "name": "Accumulated Depreciation - Equipment"
      },
      {
        "code": "1403",
        "name": "Accumulated Depreciation - Vehicles"
      },
      {
        "code": "1404",
        "name": "Accumulated Depreciation - Computers"
      },
      {
        "code": "1405",
        "name": "Accumulated Depreciation - Furniture & Fixtures"
      },
      {
        "code": "1406",
        "name": "Accumulated Depreciation - Generator / Electrical"
      }
    ],
    "class": "Non-current assets"
  },
  {
    "code": "2000",
    "name": "Trade Payables",
    "type": "Liability",
    "children": [
      {
        "code": "2001",
        "name": "Steel Suppliers",
        "description": "Amounts owed to sheet and plate suppliers."
      },
      {
        "code": "2002",
        "name": "Gas Suppliers",
        "description": "Amounts owed for oxygen, nitrogen and other gases."
      },
      {
        "code": "2003",
        "name": "Consumable Suppliers",
        "description": "Amounts owed for nozzles, lenses and other consumables."
      },
      {
        "code": "2004",
        "name": "Service Contractors",
        "description": "Amounts owed for services, utilities and other unpaid bills."
      },
      {
        "code": "2005",
        "name": "Accrued Expenses",
        "description": "Expenses incurred but not yet billed (e.g. electricity to month-end)."
      },
      {
        "code": "2006",
        "name": "Other Payables"
      }
    ],
    "class": "Current liabilities"
  },
  {
    "code": "2100",
    "name": "Customer Advances",
    "type": "Liability",
    "children": [
      {
        "code": "2101",
        "name": "Customer Advances / Deposits",
        "description": "Advance payments received from customers before invoicing."
      }
    ],
    "class": "Current liabilities"
  },
  {
    "code": "2200",
    "name": "Sales Tax & Withholding Taxes",
    "type": "Tax control",
    "children": [
      {
        "code": "2201",
        "name": "Sales Tax Input (GST)",
        "description": "Sales tax paid on purchases, claimable against output tax."
      },
      {
        "code": "2202",
        "name": "Sales Tax Output (GST)",
        "description": "Sales tax charged on invoices and scrap sales."
      },
      {
        "code": "2203",
        "name": "Sales Tax Payable / Settlement",
        "description": "Net sales tax paid to FBR or carried forward."
      },
      {
        "code": "2204",
        "name": "Withholding Tax Payable - Suppliers",
        "description": "Income tax deducted from supplier payments, payable to FBR."
      },
      {
        "code": "2205",
        "name": "Withholding Tax Payable - Salaries",
        "description": "Income tax deducted from salaries, payable to FBR."
      },
      {
        "code": "2206",
        "name": "Provincial Sales Tax on Services (PRA / SRB)",
        "description": "Sales tax on services charged or payable to the provincial authority."
      },
      {
        "code": "2207",
        "name": "Income Tax Payable",
        "description": "Income tax due for the year after adjusting advance tax."
      }
    ],
    "class": "Current liabilities"
  },
  {
    "code": "2300",
    "name": "Payroll Liabilities",
    "type": "Liability",
    "children": [
      {
        "code": "2301",
        "name": "Salaries Payable",
        "description": "Net salaries due to staff."
      },
      {
        "code": "2302",
        "name": "Payroll Deductions Payable",
        "description": "Other amounts deducted from pay and owed onwards."
      },
      {
        "code": "2303",
        "name": "EOBI Payable",
        "description": "Employer and employee EOBI contributions due."
      },
      {
        "code": "2304",
        "name": "Social Security Payable (PESSI / SESSI)",
        "description": "Provincial social security contributions due."
      }
    ],
    "class": "Current liabilities"
  },
  {
    "code": "2400",
    "name": "Loans & Borrowings",
    "type": "Liability",
    "children": [
      {
        "code": "2401",
        "name": "Bank Loan / Running Finance",
        "description": "Bank borrowings and running finance facilities."
      },
      {
        "code": "2402",
        "name": "Machine / Lease Financing",
        "description": "Financing taken to buy machines or vehicles."
      },
      {
        "code": "2403",
        "name": "Loan from Director / Owner",
        "description": "Money lent to the business by the owner or a director."
      }
    ],
    "class": "Non-current liabilities"
  },
  {
    "code": "3000",
    "name": "Owner's Equity",
    "type": "Equity",
    "children": [
      {
        "code": "3001",
        "name": "Owner Capital Contributions",
        "description": "Money and assets the owner has put into the business."
      },
      {
        "code": "3002",
        "name": "Owner Drawings",
        "description": "Money the owner has taken out (reduces equity)."
      },
      {
        "code": "3003",
        "name": "Retained Earnings",
        "description": "Profits of earlier years kept in the business."
      }
    ],
    "class": "Equity"
  },
  {
    "code": "4000",
    "name": "Laser Cutting Sales",
    "type": "Revenue",
    "children": [
      {
        "code": "4001",
        "name": "Laser Cutting Revenue",
        "description": "Cutting charges and cut parts sold."
      },
      {
        "code": "4002",
        "name": "Engraving / Marking Revenue",
        "description": "Laser engraving and marking work."
      }
    ],
    "class": "Revenue"
  },
  {
    "code": "4100",
    "name": "Design & Fabrication Sales",
    "type": "Revenue",
    "children": [
      {
        "code": "4101",
        "name": "Design / CAD Charges"
      },
      {
        "code": "4102",
        "name": "Fabrication / Bending Charges"
      },
      {
        "code": "4103",
        "name": "Welding / Finishing Charges",
        "description": "Welding, powder coating and finishing billed to customers."
      }
    ],
    "class": "Revenue"
  },
  {
    "code": "4200",
    "name": "Material Sales",
    "type": "Revenue",
    "children": [
      {
        "code": "4201",
        "name": "Material Supply Revenue",
        "description": "Sheet material sold or supplied with cutting."
      }
    ],
    "class": "Revenue"
  },
  {
    "code": "4300",
    "name": "Other Income",
    "type": "Revenue",
    "children": [
      {
        "code": "4301",
        "name": "Delivery Revenue"
      },
      {
        "code": "4302",
        "name": "Scrap Sales",
        "description": "Sale of skeletons, offcuts and other scrap."
      },
      {
        "code": "4303",
        "name": "Gain on Asset Sale"
      },
      {
        "code": "4304",
        "name": "Other Income"
      },
      {
        "code": "4305",
        "name": "Bank Profit / Interest Income"
      }
    ],
    "class": "Other income"
  },
  {
    "code": "4900",
    "name": "Sales Returns & Discounts",
    "type": "Revenue",
    "children": [
      {
        "code": "4901",
        "name": "Sales Discounts",
        "description": "Discounts allowed after invoicing (debit; reduces revenue)."
      },
      {
        "code": "4902",
        "name": "Sales Returns / Rework Credits",
        "description": "Credits given for returned or reworked jobs (debit; reduces revenue)."
      }
    ],
    "class": "Revenue"
  },
  {
    "code": "5000",
    "name": "Material Cost",
    "type": "Direct cost",
    "children": [
      {
        "code": "5001",
        "name": "Material Consumed on Jobs",
        "description": "Sheet cost issued to jobs, less offcuts returned; also stock count adjustments."
      },
      {
        "code": "5002",
        "name": "Material Wastage / Write-off",
        "description": "Damaged, lost or scrapped material written off."
      },
      {
        "code": "5003",
        "name": "Purchase Freight & Loading",
        "description": "Carriage and loading on material purchases."
      }
    ],
    "class": "Cost of sales"
  },
  {
    "code": "5100",
    "name": "Job Consumables",
    "type": "Direct cost",
    "children": [
      {
        "code": "5101",
        "name": "Assist Gas - Oxygen"
      },
      {
        "code": "5102",
        "name": "Assist Gas - Nitrogen"
      },
      {
        "code": "5103",
        "name": "Nozzles / Lenses / Ceramics"
      },
      {
        "code": "5104",
        "name": "Other Direct Consumables"
      },
      {
        "code": "5105",
        "name": "Compressed Air / Other Gases"
      }
    ],
    "class": "Cost of sales"
  },
  {
    "code": "5200",
    "name": "Direct Job Costs",
    "type": "Direct cost",
    "children": [
      {
        "code": "5201",
        "name": "Direct Labour",
        "description": "Wages of operators and helpers working on jobs."
      },
      {
        "code": "5202",
        "name": "Outsourced Bending / Fabrication"
      },
      {
        "code": "5203",
        "name": "Job-Specific Transport"
      },
      {
        "code": "5204",
        "name": "Machine Power (Electricity on Jobs)",
        "description": "Electricity charged to production, if you split it from workshop electricity."
      }
    ],
    "class": "Cost of sales"
  },
  {
    "code": "6000",
    "name": "Workshop Expenses",
    "type": "Expense",
    "children": [
      {
        "code": "6001",
        "name": "Workshop Rent"
      },
      {
        "code": "6002",
        "name": "Electricity"
      },
      {
        "code": "6003",
        "name": "Machine Maintenance & Repairs"
      },
      {
        "code": "6004",
        "name": "Spare Parts"
      },
      {
        "code": "6005",
        "name": "PPE & Safety Equipment"
      },
      {
        "code": "6006",
        "name": "Cleaning"
      },
      {
        "code": "6007",
        "name": "Insurance"
      },
      {
        "code": "6008",
        "name": "Generator Fuel / Diesel"
      },
      {
        "code": "6009",
        "name": "Water & Gas (Utility)"
      }
    ],
    "class": "Operating expenses"
  },
  {
    "code": "6100",
    "name": "Salaries & Staff Costs",
    "type": "Expense",
    "children": [
      {
        "code": "6101",
        "name": "Administration Salaries"
      },
      {
        "code": "6102",
        "name": "Overtime"
      },
      {
        "code": "6103",
        "name": "Other Staff Costs"
      },
      {
        "code": "6104",
        "name": "EOBI / Social Security - Employer",
        "description": "Employer share of EOBI and PESSI/SESSI."
      },
      {
        "code": "6105",
        "name": "Staff Welfare & Meals"
      },
      {
        "code": "6106",
        "name": "Bonus & Incentives"
      }
    ],
    "class": "Operating expenses"
  },
  {
    "code": "6200",
    "name": "Office & Admin Expenses",
    "type": "Expense",
    "children": [
      {
        "code": "6201",
        "name": "Internet / Telephone"
      },
      {
        "code": "6202",
        "name": "Software / CAD Subscription"
      },
      {
        "code": "6203",
        "name": "Printing / Stationery"
      },
      {
        "code": "6204",
        "name": "Accounting / Professional Fees"
      },
      {
        "code": "6205",
        "name": "Advertising / Marketing"
      },
      {
        "code": "6206",
        "name": "Sales Commission"
      },
      {
        "code": "6207",
        "name": "Customer Entertainment"
      },
      {
        "code": "6208",
        "name": "Other Government Fees"
      },
      {
        "code": "6209",
        "name": "Other Administration"
      },
      {
        "code": "6210",
        "name": "Travel & Conveyance"
      },
      {
        "code": "6211",
        "name": "Vehicle Running & Fuel"
      },
      {
        "code": "6212",
        "name": "Office Rent"
      }
    ],
    "class": "Operating expenses"
  },
  {
    "code": "6300",
    "name": "Depreciation",
    "type": "Expense",
    "children": [
      {
        "code": "6301",
        "name": "Depreciation - Laser Machine"
      },
      {
        "code": "6302",
        "name": "Depreciation - Equipment & Tools"
      },
      {
        "code": "6303",
        "name": "Depreciation - Vehicles"
      },
      {
        "code": "6304",
        "name": "Depreciation - Computers, Furniture & Electrical"
      }
    ],
    "class": "Operating expenses"
  },
  {
    "code": "6400",
    "name": "Finance Costs",
    "type": "Expense",
    "children": [
      {
        "code": "6401",
        "name": "Bank Charges",
        "description": "Account fees, IBFT, cheque book and other bank charges."
      },
      {
        "code": "6402",
        "name": "Markup / Interest on Loans",
        "description": "Markup on bank loans, running finance and machine financing."
      },
      {
        "code": "6403",
        "name": "Exchange Loss"
      }
    ],
    "class": "Finance costs"
  },
  {
    "code": "6900",
    "name": "Other Expenses",
    "type": "Expense",
    "children": [
      {
        "code": "6901",
        "name": "Bad Debts Written Off",
        "description": "Customer balances that will not be recovered."
      },
      {
        "code": "6902",
        "name": "Loss on Asset Disposal"
      },
      {
        "code": "6903",
        "name": "Donations"
      },
      {
        "code": "6904",
        "name": "Penalties & Fines"
      }
    ],
    "class": "Other expenses"
  },
  {
    "code": "7000",
    "name": "Taxation",
    "type": "Expense",
    "children": [
      {
        "code": "7001",
        "name": "Income Tax Expense",
        "description": "Income tax for the year (current and minimum tax)."
      }
    ],
    "class": "Taxation"
  }
];
export const accountList=accountGroups.flatMap(g=>g.children.map(a=>({...a,parent:g.code,type:g.type,class:g.class})));
export function expenseAccounts(category){return accountList.filter(a=>!a.inactive&&(category==='Capital expense'?a.parent==='1300':['Direct cost','Expense'].includes(a.type)));}
// Codes the app posts to by itself; they can be renamed but not deactivated.
export const systemAccounts=['1001','1002','1003','1101','1102','1201','1202','1203','1206','2001','2002','2003','2004','2201','2202','2203','2301','2302','3001','4001','4302','5001','5101','5102','5103','5104','5201','5202','5203','6101','6102'];
// The business's own changes to the chart, kept in company settings: {custom:[{code,name,parent,description}], renamed:{code:name}, inactive:[code]}.
// Applied to the shared lists in place so every module (ledger checks, reports, pickers) sees the same chart.
export function applyChartSettings(coa={}){
 const inactive=new Set(coa.inactive||[]);
 for(const g of accountGroups){
  g.children=g.children.filter(c=>!c.custom);
  for(const c of g.children){if(c.baseName===undefined)c.baseName=c.name;c.name=coa.renamed?.[c.code]||c.baseName;c.inactive=inactive.has(c.code)}
 }
 for(const a of coa.custom||[]){const g=accountGroups.find(x=>x.code===a.parent);if(!g||g.children.some(c=>c.code===a.code))continue;g.children.push({code:a.code,name:a.name,description:a.description||'',custom:true,inactive:inactive.has(a.code)});g.children.sort((x,y)=>x.code.localeCompare(y.code))}
 accountList.length=0;accountList.push(...accountGroups.flatMap(g=>g.children.map(a=>({...a,parent:g.code,type:g.type,class:g.class}))));
}
export function nextAccountCode(group){const base=Number(group.code),used=new Set(accountList.map(a=>Number(a.code)));for(let n=base+1;n<base+100;n++)if(!used.has(n))return String(n);return ''}
export function accountProblem(a,list=accountList){
 if(!/^\d{4}$/.test(a.code||''))return 'Enter a 4-digit account code.';
 const g=accountGroups.find(x=>x.code===a.parent);if(!g)return 'Choose the group.';
 if(Number(a.code)<=Number(g.code)||Number(a.code)>=Number(g.code)+100)return `Use a code between ${Number(g.code)+1} and ${Number(g.code)+99} for ${g.name}.`;
 if(list.some(x=>x.code===a.code))return `Code ${a.code} is already used.`;
 if(!String(a.name||'').trim())return 'Enter the account name.';
 return '';
}
