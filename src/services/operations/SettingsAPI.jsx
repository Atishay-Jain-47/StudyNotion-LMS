import { toast } from "react-hot-toast"

import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiconnector"
import { settingsEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
} = settingsEndpoints

export function updateDisplayPicture(token, formData) {
  return async (dispatch, getState) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      )
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Display Picture Updated Successfully")
      // Merge with existing user to keep all fields
      const currentUser = getState().profile.user
      const userData = response.data.profile || response.data.data
      const userImage = userData.image
        ? userData.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`
      dispatch(setUser({ ...currentUser, ...userData, image: userImage }))
    } catch (error) {
      toast.error("Could Not Update Display Picture")
    }
    toast.dismiss(toastId)
  }
}

export function updateProfile(token, formData) {
  return async (dispatch, getState) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Updated Successfully")
      // Merge with existing user to keep all fields
      const currentUser = getState().profile.user
      const updatedUser = response.data.data || response.data.updatedUserDetails
      const userImage = updatedUser.image
        ? updatedUser.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${updatedUser.firstName} ${updatedUser.lastName}`
      dispatch(setUser({ ...currentUser, ...updatedUser, image: userImage }))
    } catch (error) {
      toast.error("Could Not Update Profile")
    }
    toast.dismiss(toastId)
  }
}

export async function changePassword(token, formData) {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
      Authorization: `Bearer ${token}`,
    })
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Password Changed Successfully")
  } catch (error) {
    toast.error(error.response?.data?.message || "Could Not Change Password")
  }
  toast.dismiss(toastId)
}

export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Deleted Successfully")
      dispatch(logout(navigate))
    } catch (error) {
      toast.error("Could Not Delete Profile")
    }
    toast.dismiss(toastId)
  }
}