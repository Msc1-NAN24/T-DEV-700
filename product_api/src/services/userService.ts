import { User } from "@prisma/client";
import { prisma } from "..";

export default class UserService {
  create = async (newUser: any) => {
    const user = await prisma.user.create({
      data: { ...newUser },
    });
    return user;
  };

  getAll = async (): Promise<User[]> => {
    const allUsers = await prisma.user.findMany();
    return allUsers;
  };

  getById = async (id: string) => {
    const user = await prisma.user.findMany();
    return user;
  };

  update = async (id: string, userUpdate: Partial<User>) => {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: { ...userUpdate },
    });
    return user;
  };

  deleteUser = async (id: string, userUpdate: Partial<User>) => {
    const user = await prisma.user.delete({
      where: {
        id,
      },
    });
    return user;
  };
}
