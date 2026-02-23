import createNextIntlPlugin from "next-intl/plugin";

// بنحدد المسار الجديد هنا
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // أي إعدادات تانية عندك سبيها هنا
};

export default withNextIntl(nextConfig);
