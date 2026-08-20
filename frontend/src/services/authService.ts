import type { ProfilePasswordRequest, ProfilePasswordTokenResponse, ResponseWithMetadata } from '@types'
import { apiHelperAuth, apiHelperCore } from '@utils'

export const authService = {
  login: async (email: string, password: string): Promise<ProfilePasswordTokenResponse> => {
    return await apiHelperAuth.post<ProfilePasswordTokenResponse>(
      `/v1/cors/platform/{platformId}/login`,
      { email, password },
      {
        withCredentials: true,
        noAuth: true,
      },
    )
  },

  refreshToken: async (profileId: number, csrfToken: string): Promise<ProfilePasswordTokenResponse> => {
    return await apiHelperAuth.get<ProfilePasswordTokenResponse>(
      `/v1/cors/platform/{platformId}/profile/${profileId}/refresh`,
      undefined,
      {
        withCredentials: true,
        headers: {
          'x-auth-csrf': csrfToken,
        },
        noAuth: true,
      },
    )
  },

  logout: async (profileId: number): Promise<void> => {
    await apiHelperAuth.get(
      `/v1/cors/platform/{platformId}/profile/${profileId}/logout`,
      {},
      {
        noAuth: true,
      },
    )
  },

  resetProfileInit: async (email: string): Promise<ResponseWithMetadata> => {
    return await apiHelperCore.get<ResponseWithMetadata>(
      `/v1/auth/platform/{platformId}/reset_init`,
      { email },
      {
        noAuth: true,
      },
    )
  },

  resetProfile: async (profilePasswordRequest: ProfilePasswordRequest): Promise<ResponseWithMetadata> => {
    return await apiHelperCore.post<ResponseWithMetadata>(
      `/v1/auth/platform/{platformId}/reset`,
      profilePasswordRequest,
      {
        noAuth: true,
      },
    )
  },
}
