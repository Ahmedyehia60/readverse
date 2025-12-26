import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // بننتظر القيمة لأنها Promise في النسخ الجديدة
  let locale = await requestLocale;

  // التأكد من أن القيمة مدعومة، وإلا نستخدم الافتراضية
  if (!locale || !routing.locales.includes(locale as "en" | "ar")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
