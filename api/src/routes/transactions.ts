import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { CustomRequest } from "../types/request";
import { CustomResponse } from "../types/response";
import authorization from "../middleware/authorization";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime";

const prisma = new PrismaClient();
const router = Router();

router
  .route("/users/:id/send")
  .all(authorization)
  .post(async (req: CustomRequest, res: CustomResponse) => {
    const { id } = req.params;
    const { amount } = req.body;

    try {
      const sender = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
        include: {
          account: true,
        },
      });

      const receiver = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          account: true,
        },
      });

      if (sender && receiver) {
        const transaction = await prisma.transaction.create({
          data: {
            amount: amount,
            receiver: {
              connect: {
                user_id: receiver.id,
              },
            },
            sender: {
              connect: {
                user_id: sender.id,
              },
            },
          },
        });

        if (sender.account && sender.account.ceiling <= amount) {
          res.status(400).json({
            success: false,
            message: "Amount exceeds ceiling",
          });

          await prisma.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              is_refused: true,
            },
          });

          await prisma.user.update({
            where: {
              id: sender.id,
            },
            include: {
              account: true,
            },
            data: {
              account: {
                update: {
                  refusal_count: {
                    increment: 1,
                  },
                },
              },
            },
          });
        } else if (sender.account && sender.account.balance >= amount) {
          try {
            await prisma.user.update({
              where: {
                id: sender.id,
              },
              data: {
                account: {
                  update: {
                    balance: {
                      decrement: amount,
                    },
                  },
                },
              },
            });

            await prisma.user.update({
              where: {
                id: receiver.id,
              },
              data: {
                account: {
                  upsert: {
                    create: {
                      balance: amount,
                    },
                    update: {
                      balance: {
                        increment: amount,
                      },
                    },
                  },
                },
              },
            });
          } catch (err) {
            if (
              err instanceof PrismaClientKnownRequestError ||
              err instanceof PrismaClientUnknownRequestError
            ) {
              // Revert both users' balances
              await prisma.user.update({
                where: {
                  id: sender.id,
                },
                include: {
                  account: true,
                },
                data: {
                  account: {
                    upsert: {
                      create: {
                        balance: 0,
                      },
                      update: {
                        balance: sender.account!.balance,
                      },
                    },
                  },
                },
              });

              await prisma.user.update({
                where: {
                  id: receiver.id,
                },
                include: {
                  account: true,
                },
                data: {
                  account: {
                    upsert: {
                      create: {
                        balance: 0,
                      },
                      update: {
                        balance: receiver.account!.balance,
                      },
                    },
                  },
                },
              });
            }
          }

          res.status(200).json({
            success: true,
            data: {
              new_balance: sender.account!.balance - amount,
            },
          });

          await prisma.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              is_successful: true,
            },
          });
        } else if (
          sender.account &&
          -1 * sender.account.max_overdraft <= sender.account.balance - amount
        ) {
          try {
            await prisma.user.update({
              where: {
                id: sender.id,
              },
              data: {
                account: {
                  update: {
                    balance: {
                      decrement: amount,
                    },
                  },
                },
              },
            });

            await prisma.user.update({
              where: {
                id: receiver.id,
              },
              data: {
                account: {
                  upsert: {
                    create: {
                      balance: amount,
                    },
                    update: {
                      balance: {
                        increment: amount,
                      },
                    },
                  },
                },
              },
            });
          } catch (err) {
            if (
              err instanceof PrismaClientKnownRequestError ||
              err instanceof PrismaClientUnknownRequestError
            ) {
              // Revert both users' balances
              await prisma.user.update({
                where: {
                  id: sender.id,
                },
                include: {
                  account: true,
                },
                data: {
                  account: {
                    upsert: {
                      create: {
                        balance: 0,
                      },
                      update: {
                        balance: sender.account!.balance,
                      },
                    },
                  },
                },
              });

              await prisma.user.update({
                where: {
                  id: receiver.id,
                },
                include: {
                  account: true,
                },
                data: {
                  account: {
                    upsert: {
                      create: {
                        balance: 0,
                      },
                      update: {
                        balance: receiver.account!.balance,
                      },
                    },
                  },
                },
              });
            }
          }

          res.status(200).json({
            success: true,
            data: {
              new_balance: sender.account!.balance - amount,
            },
          });

          await prisma.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              is_successful: true,
              is_overdraft: true,
            },
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Insufficient funds",
          });

          await prisma.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              is_refused: true,
            },
          });

          await prisma.user.update({
            where: {
              id: sender.id,
            },
            include: {
              account: true,
            },
            data: {
              account: {
                update: {
                  refusal_count: {
                    increment: 1,
                  },
                },
              },
            },
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

export default router;
