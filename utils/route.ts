export const isCurrentRoute = (to: string) => {
  const route = useRoute();
  return route.path === to;
};
