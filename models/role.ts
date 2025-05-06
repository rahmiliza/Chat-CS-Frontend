export interface PermissionGroup {
  [moduleName: string]: Permission[]
}

export interface Permission {
  id: number;
  created_at: number;
  updated_at: number;
  identifier: string;
  module: string;
  name: string;
  description: string;
  deleted_at: number | null;
}

// export interface Permission {
//   [key: string]: {
//     name: string
//     sub_modules: {
//       [key: string]: {
//         name: string
//         sub_modules: {
//           [key: string]: {
//             name: string
//             sub_modules: {}
//             permissions: Permission[]
//           }
//         }
//         permissions: Permission[]
//       }
//     }
//     permissions: Permission[]
//   }
// }

export interface Role {
  id: string
  created_at: number
  updated_at: number
  name: string
}

export interface RoleDetails {
  id: string
  created_at: number
  updated_at: number
  name: string
  permissions: {
    created_at: number
    description: string
    id: number
    identifier: string
    module: string
    name: string
    updated_at: number
  }[]
}
