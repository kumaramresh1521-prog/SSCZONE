import AppScreenshotsGallery from "@/components/AppScreenshotsGallery";
import type { MobileAppReleaseInfo } from "@/lib/mobile-app-release";

export default function MobileAppShowcaseSection({
  release,
}: {
  release: MobileAppReleaseInfo;
}) {
  return (
    <section
      id="ssczone-app"
      className="py-12 md:py-16 px-4 max-w-6xl mx-auto w-full"
    >
      <AppScreenshotsGallery release={release} variant="homepage" />
    </section>
  );
}
