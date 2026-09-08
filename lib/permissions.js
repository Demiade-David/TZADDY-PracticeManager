export const PERMISSIONS = {
  dashboard: {
    label: "Dashboard",
    admin: true,
    manager: true,
    staff: true,
  },

  clients: {
    label: "Clients",
    admin: true,
    manager: true,
    staff: true,
  },

  engagements: {
    label: "Engagements",
    admin: true,
    manager: true,
    staff: true,
  },

  filings: {
    label: "Filing Tracker",
    admin: true,
    manager: true,
    staff: true,
  },

  billing: {
    label: "Payments & Billing",
    admin: true,
    manager: true,
    staff: true,
  },

  documents: {
    label: "Documents",
    admin: true,
    manager: true,
    staff: true,
  },

  reports: {
    label: "Reports",
    admin: true,
    manager: true,
    staff: false,
  },

  staffManagement: {
    label: "Staff & Users",
    admin: true,
    manager: false,
    staff: false,
  },

  practiceSettings: {
    label: "Practice Information",
    admin: true,
    manager: false,
    staff: false,
  },

  permissions: {
    label: "Roles & Permissions",
    admin: true,
    manager: false,
    staff: false,
  },

  security: {
    label: "Security",
    admin: true,
    manager: true,
    staff: true,
  },
};

export function hasPermission(role, permission) {
  return Boolean(
    PERMISSIONS[permission]?.[role]
  );
}