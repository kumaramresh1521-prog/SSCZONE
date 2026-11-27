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
      className="pt-8 pb-2 px-4 max-w-5xl mx-auto w-full"
    >
      <AppScreenshotsGallery release={release} variant="homepage" />
    </section>
  );
}
