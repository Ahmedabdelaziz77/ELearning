import { Request, Response } from "express";
import { clerkClient } from "../index";
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const userData = req.body;
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    });
    res.status(200).json({ message: "user updated successfully", data: user });
  } catch (err) {
    res.status(500).json({
      message: "Error Updating a user",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
