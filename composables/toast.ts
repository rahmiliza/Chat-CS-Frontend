import { nanoid } from "nanoid";
import type { Notification } from "~/types/notification";

export const useToast = () => {
  const notifications = useState<Notification[]>("notifications", () => []);

  const add = (notification: Partial<Notification>) => {
    console.log("notification", notification);
    const body = <Notification>{
      id: nanoid(),
      ...notification,
    };

    notifications.value.push(body);
  };

  const remove = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const update = (id: string, notification: Partial<Notification>) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value[index] = {
        ...notifications.value[index],
        ...notification,
      };
    }
  };

  const clear = () => {
    notifications.value = [];
  };

  return {
    add,
    remove,
    update,
    clear,
  };
};
