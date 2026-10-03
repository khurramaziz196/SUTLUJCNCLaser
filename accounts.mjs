export const accountGroups = [
  {
    "code": "1000",
    "name": "Cash & Bank",
    "type": "Asset",
    "children": [
      {
        "code": "1001",
        "name": "Cash on Hand"
      },
      {
        "code": "1002",
        "name": "Business Bank Account"
      },
      {
        "code": "1003",
        "name": "Petty Cash"
      }
    ]
  },
  {
    "code": "1100",
    "name": "Accounts Receivable",
    "type": "Asset",
    "children": [
      {
        "code": "1101",
        "name": "Customer Receivables"
      },
      {
        "code": "1102",
        "name": "Staff Advances"
      }
    ]
  },
  {
    "code": "1200",
    "name": "Inventory / Materials",
    "type": "Asset",
    "children": [
      {
        "code": "1201",
        "name": "Raw Material - Mild Steel"
      },
      {
        "code": "1202",
        "name": "Raw Material - Stainless Steel"
      },
      {
        "code": "1203",
        "name": "Raw Material - Aluminium"
      },
      {
        "code": "1204",
        "name": "Work in Progress"
      },
      {
        "code": "1205",
        "name": "Finished Goods"
      }
    ]
  },
  {
    "code": "1300",
    "name": "Fixed Assets",
    "type": "Asset",
    "children": [
      {
        "code": "1301",
        "name": "CNC Laser Machine"
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
        "name": "Gas System"
      },
      {
        "code": "1305",
        "name": "Material Handling Equipment"
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
        "name": "Furniture"
      }
    ]
  },
  {
    "code": "1400",
    "name": "Accumulated Depreciation",
    "type": "Contra asset",
    "children": [
      {
        "code": "1401",
        "name": "Laser Machine Depreciation"
      },
      {
        "code": "1402",
        "name": "Equipment Depreciation"
      },
      {
        "code": "1403",
        "name": "Vehicle Depreciation"
      },
      {
        "code": "1404",
        "name": "Computer Depreciation"
      }
    ]
  },
  {
    "code": "2000",
    "name": "Accounts Payable",
    "type": "Liability",
    "children": [
      {
        "code": "2001",
        "name": "Steel Suppliers"
      },
      {
        "code": "2002",
        "name": "Gas Suppliers"
      },
      {
        "code": "2003",
        "name": "Consumable Suppliers"
      },
      {
        "code": "2004",
        "name": "Service Contractors"
      }
    ]
  },
  {
    "code": "2100",
    "name": "Customer Advances",
    "type": "Liability",
    "children": [
      {
        "code": "2101",
        "name": "Customer Advances / Deposits"
      }
    ]
  },
  {
    "code": "2200",
    "name": "VAT / Tax Control",
    "type": "Tax control",
    "children": [
      {
        "code": "2201",
        "name": "VAT Input"
      },
      {
        "code": "2202",
        "name": "VAT Output"
      },
      {
        "code": "2203",
        "name": "VAT Payable / Receivable"
      }
    ]
  },
  {
    "code": "2300",
    "name": "Payroll Liabilities",
    "type": "Liability",
    "children": [
      {
        "code": "2301",
        "name": "Salaries Payable"
      },
      {
        "code": "2302",
        "name": "Payroll Deductions Payable"
      }
    ]
  },
  {
    "code": "3000",
    "name": "Owner Capital",
    "type": "Equity",
    "children": [
      {
        "code": "3001",
        "name": "Owner Capital Contributions"
      },
      {
        "code": "3002",
        "name": "Owner Drawings"
      },
      {
        "code": "3003",
        "name": "Retained Earnings"
      }
    ]
  },
  {
    "code": "4000",
    "name": "Laser Cutting Sales",
    "type": "Revenue",
    "children": [
      {
        "code": "4001",
        "name": "Laser Cutting Revenue"
      }
    ]
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
      }
    ]
  },
  {
    "code": "4200",
    "name": "Material Sales",
    "type": "Revenue",
    "children": [
      {
        "code": "4201",
        "name": "Material Supply Revenue"
      }
    ]
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
        "name": "Scrap Sales"
      },
      {
        "code": "4303",
        "name": "Gain on Asset Sale"
      },
      {
        "code": "4304",
        "name": "Other Income"
      }
    ]
  },
  {
    "code": "5000",
    "name": "Material Cost",
    "type": "Direct cost",
    "children": [
      {
        "code": "5001",
        "name": "Material Consumed on Jobs"
      }
    ]
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
        "name": "Nozzles / Lenses"
      },
      {
        "code": "5104",
        "name": "Other Direct Consumables"
      }
    ]
  },
  {
    "code": "5200",
    "name": "Direct Job Costs",
    "type": "Direct cost",
    "children": [
      {
        "code": "5201",
        "name": "Direct Labour"
      },
      {
        "code": "5202",
        "name": "Outsourced Bending / Fabrication"
      },
      {
        "code": "5203",
        "name": "Job-Specific Transport"
      }
    ]
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
        "name": "Machine Maintenance"
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
      }
    ]
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
      }
    ]
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
      }
    ]
  },
  {
    "code": "6300",
    "name": "Vehicle & Delivery Expenses",
    "type": "Expense",
    "children": [
      {
        "code": "6301",
        "name": "Fuel"
      },
      {
        "code": "6302",
        "name": "Vehicle Repairs"
      },
      {
        "code": "6303",
        "name": "Courier / Delivery"
      }
    ]
  },
  {
    "code": "6400",
    "name": "Bank & Finance Charges",
    "type": "Expense",
    "children": [
      {
        "code": "6401",
        "name": "Bank Charges"
      },
      {
        "code": "6402",
        "name": "Finance Charges"
      }
    ]
  },
  {
    "code": "6500",
    "name": "Depreciation",
    "type": "Expense",
    "children": [
      {
        "code": "6501",
        "name": "Laser Machine Depreciation Expense"
      },
      {
        "code": "6502",
        "name": "Equipment Depreciation Expense"
      },
      {
        "code": "6503",
        "name": "Vehicle Depreciation Expense"
      },
      {
        "code": "6504",
        "name": "Computer Depreciation Expense"
      }
    ]
  },
  {
    "code": "6600",
    "name": "Other Expenses",
    "type": "Expense",
    "children": [
      {
        "code": "6601",
        "name": "Loss on Asset Sale"
      }
    ]
  }
];
export const accountList=accountGroups.flatMap(g=>g.children.map(a=>({...a,parent:g.code,type:g.type})));
export function expenseAccounts(category){return accountList.filter(a=>category==='Capital expense'?a.parent==='1300':['Direct cost','Expense'].includes(a.type));}
