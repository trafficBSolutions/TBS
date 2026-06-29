import { useState, useEffect } from 'react';

const EMAIL_SETS = {
  invoice: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions1999@gmail.com',
    'trafficandbarriersolutions.ap@gmail.com', 'tbsellen@gmail.com',
    'tbsolutions1995@gmail.com', 'materialworx2@gmail.com'
  ]),
  quotes: new Set([
    'tbsolutions1999@gmail.com', 'tbsolutions9@gmail.com',
    'tbsolutions4@gmail.com', 'materialworx2@gmail.com'
  ]),
  discipline: new Set(['tbsolutions4@gmail.com', 'tbsolutions9@gmail.com']),
  empPassword: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions4@gmail.com', 'tbsolutions1999@gmail.com'
  ]),
  signShop: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions1999@gmail.com',
    'tbsolutions4@gmail.com', 'materialworx2@gmail.com'
  ]),
  shopWo: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions1999@gmail.com',
    'tbsolutions4@gmail.com', 'materialworx2@gmail.com', 'tbsolutions1995@gmail.com'
  ]),
  printCosts: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions4@gmail.com', 'tbsolutions1999@gmail.com'
  ]),
  salary: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions4@gmail.com', 'tbsolutions1995@gmail.com',
    'trafficandbarriersolutions.ap@gmail.com', 'tbsolutions1999@gmail.com',
    'tbsolutions77@gmail.com', 'tbsolutions14@gmail.com', 'materialworx2@gmail.com'
  ]),
  editHours: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions4@gmail.com',
    'tbsolutions1999@gmail.com', 'tbsolutions1995@gmail.com', 'materialworx2@gmail.com'
  ]),
  personalClock: new Set(['materialworx2@gmail.com']),
  hourlyAdmin: new Set(['tbsolutions66@gmail.com']),
  invoiceStats: new Set([
    'tbsolutions9@gmail.com', 'tbsolutions4@gmail.com', 'materialworx2@gmail.com',
    'tbsolutions.work.orders@gmail.com', 'tbsolutions1999@gmail.com',
    'tbsolutions1995@gmail.com', 'trafficandbarriersolutions.ap@gmail.com'
  ])
};

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [permissions, setPermissions] = useState({
    allowedForInvoices: false,
    allowedForQuotes: false,
    allowedForDiscipline: false,
    allowedForEmpPassword: false,
    allowedForSignShop: false,
    allowedForShopWo: false,
    allowedForPrintCosts: false,
    isSalaryAdmin: false,
    canEditHours: false,
    isPersonalClock: false,
    isHourlyAdmin: false,
    canViewInvoiceStats: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (!stored) return;

    const user = JSON.parse(stored);
    setAdminName(user.firstName);
    setAdminEmail(user.email);
    setIsAdmin(true);

    const canInvoice =
      (Array.isArray(user?.roles) && user.roles.includes('billing')) ||
      (Array.isArray(user?.permissions) && user.permissions.includes('INVOICING')) ||
      EMAIL_SETS.invoice.has(user.email);

    setPermissions({
      allowedForInvoices: Boolean(canInvoice),
      allowedForQuotes: EMAIL_SETS.quotes.has(user.email),
      allowedForDiscipline: EMAIL_SETS.discipline.has(user.email),
      allowedForEmpPassword: EMAIL_SETS.empPassword.has(user.email),
      allowedForSignShop: EMAIL_SETS.signShop.has(user.email),
      allowedForShopWo: EMAIL_SETS.shopWo.has(user.email),
      allowedForPrintCosts: EMAIL_SETS.printCosts.has(user.email),
      isSalaryAdmin: EMAIL_SETS.salary.has(user.email),
      canEditHours: EMAIL_SETS.editHours.has(user.email),
      isPersonalClock: EMAIL_SETS.personalClock.has(user.email),
      isHourlyAdmin: EMAIL_SETS.hourlyAdmin.has(user.email),
      canViewInvoiceStats: EMAIL_SETS.invoiceStats.has(user.email),
    });
  }, []);

  return { isAdmin, adminName, adminEmail, ...permissions };
};

export default useAdminAuth;
