export const useApiUrl = () => {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.apiBaseUrl;

    const category = apiBaseUrl + "/admin/category";
    const brand = apiBaseUrl + "/admin/brand";
    const catalogue = apiBaseUrl + "/admin/catalogue";
    const priceHistory = apiBaseUrl + "/admin/catalogue/";
    const installment = apiBaseUrl + "/admin/installment";
    const banner = apiBaseUrl + "/admin/banner/";
    return {
        category,
        brand,
        catalogue,
        priceHistory,
        installment,
        banner
    }
}