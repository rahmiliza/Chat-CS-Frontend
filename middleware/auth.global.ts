import type { RouteLocationNormalized } from "vue-router";

export default defineNuxtRouteMiddleware((to, from) => {
  const { allowed, redirectTo } = checkAuthentication(to);

  if (!allowed) {
    return navigateTo(redirectTo ?? "/auth/login");
  }
});

interface AuthenticationCheck {
  allowed: boolean;
  redirectTo?: string;
}

function checkAuthentication(to: RouteLocationNormalized): AuthenticationCheck {
  const { isLoggedIn } = useAuthStore();

  const authPrerequisite = to.meta?.auth;

  if (authPrerequisite === false) {
    return {
      allowed: true,
    };
  }

  if (authPrerequisite === "guest") {
    if (isLoggedIn) {
      return {
        allowed: false,
        redirectTo: "/",
      };
    } else {
      return {
        allowed: true,
      };
    }
  }

  if (!isLoggedIn) {
    return {
      allowed: false,
      redirectTo: "/auth/login",
    };
  }

  return {
    allowed: true,
  };
}
