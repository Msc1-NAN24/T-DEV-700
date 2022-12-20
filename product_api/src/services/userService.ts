import { User } from "@prisma/client";
import prisma from "../client";
import crypto from "crypto";

export default class UserService {
  create = async (newUser: any) => {
    const user = await prisma.user.create({
      data: {
        ...newUser,
        password: crypto
          .createHash("sha256")
          .update(newUser.password)
          .digest("hex"),
      },
    });
    return user;
  };

export const getAll = async () => {
  const allUsers = await prisma.user.findMany({
    select: { email: true, id: true, orders: true, username: true },
  });
  return allUsers;
};

export const getById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: { email: true, id: true, orders: true, username: true },
  });
  return user;
};

export const update = async (id: string, userUpdate: Partial<User>) => {
  const user = await prisma.user.update({
    where: {
      id,
    },
    select: { email: true, id: true, orders: true, username: true },
    data: { ...userUpdate },
  });
  return user;
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.delete({
    where: {
      id,
    },
    select: { email: true, id: true, username: true },
  });
  return user;
};
