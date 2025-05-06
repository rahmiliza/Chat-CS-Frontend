import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { defineStore } from "pinia";

export interface AccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  roleId: string;
  permissions?: string[] | null;
  userPermissions?: string[] | null;
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    const accessToken = ref<AccessToken>();
    const expiresAtTimestamp = ref<number>();
    const user = ref<User>();

    const bearerToken = computed(() => accessToken.value?.access_token);
    const expiresAt = computed(() => new Date(expiresAtTimestamp.value ?? 0));
    const isLoggedIn = computed(
      () => !!bearerToken.value && (expiresAtTimestamp.value ?? 0) > Date.now(),
    );
    const permissions = computed(() => {
      if (!isLoggedIn.value) {
        return []
      }
      const payload = decodeJwt(accessToken.value!.access_token)
      return payload.permissions as string[]
    })

    const setAccessToken = async (type: string, token: AccessToken): Promise<boolean> => {
      const {
        public: { apiBaseUrl },
      } = useRuntimeConfig();
      
      const keysUrl = new URL(apiBaseUrl);
      keysUrl.pathname = "/keys";
      const jwks = createRemoteJWKSet(keysUrl);
      try {
        await jwtVerify(token.access_token, jwks);
      } catch (e) {
        return false;
      }

      accessToken.value = token;
      expiresAtTimestamp.value = Date.now() + token.expires_in * 1000;

      const meUrl = new URL(apiBaseUrl);
      if(type == 'admin'){
        meUrl.pathname = "auth/admin/";
      }else{
        meUrl.pathname = "auth/customer/";
      }
      const response = await fetch(meUrl.toString(), {
        headers: {
          Authorization: `Bearer ${bearerToken.value}`,
        },
      });

      if (!response.ok) {
        console.log("Failed to fetch user data");
      } else {
        let data = await response.json();
        if(type == 'admin'){
          user.value = {
            id: data.id,
            name: data.name,
            username: data.username,
            roleId: data.role_id,
            userPermissions: data?.role?.permissions?.map((item) => item?.identifier) ?? [],
          };
        }else{
          user.value = {
            id: data.data.id,
            name: data.data.display_name,
            username: data.data.display_name,
            roleId: data.data.role_id,
            userPermissions: data.data?.role?.permissions?.map((item) => item?.identifier) ?? [],
          };
        }
      }

      return true;
    };

    const logout = () => {
      accessToken.value = undefined;
      expiresAtTimestamp.value = undefined;
      user.value = undefined;

      navigateTo("/auth/login");
    }

    return {
      accessToken,
      bearerToken,
      user,
      expiresAtTimestamp,
      expiresAt,
      isLoggedIn,
      permissions,
      setAccessToken,
      logout,
    };
  },
  {
    persist: {
      key: "appName__auth__",
    },
  },
);
