import { User } from "@prisma/client";
import { prisma } from "..";

export default class UserService {
  create = async (newUser: any) => {
    const user = await prisma.user.create({
      data: { ...newUser },
    });
    return user;
  };

  getAll = async () => {
    const allUsers = await prisma.user.findMany({
      select: { email: true, id: true, orders: true, username: true },
    });
    return allUsers;
  };

  getById = async (id: string) => {
    const user = await prisma.user.findMany({
      select: { email: true, id: true, orders: true, username: true },
    });
    return user;
  };

  update = async (id: string, userUpdate: Partial<User>) => {
    const user = await prisma.user.update({
      where: {
        id,
      },
      select: { email: true, id: true, orders: true, username: true },
      data: { ...userUpdate },
    });
    return user;
  };

  deleteUser = async (id: string) => {
    const user = await prisma.user.delete({
      where: {
        id,
      },
      select: { email: true, id: true, orders: true, username: true },
    });
    return user;
  };
}
