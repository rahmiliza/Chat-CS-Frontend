export function hasPermission(requiredPermission: string): boolean {
  const { user } = useAuthStore()

  const userPermissionsList = user?.userPermissions

  return userPermissionsList?.includes(requiredPermission) ?? false
}

export function checkPermission(requiredPermission: string): void {
  if (!hasPermission(requiredPermission)) {
    navigateTo('/403')
  }
}
