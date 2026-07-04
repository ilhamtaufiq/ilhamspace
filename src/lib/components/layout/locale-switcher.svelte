<script lang="ts">
  import { page } from "$app/stores";

  import Button from "$lib/components/ui/button.svelte";
  import { getLocaleContext } from "$lib/i18n/context";
  import { cn } from "$lib/utils";

  const { locale, t } = getLocaleContext();

  const redirectPath = $derived(
    encodeURIComponent($page.url.pathname + $page.url.search),
  );
</script>

<div
  class="flex items-center gap-0.5"
  role="group"
  aria-label={t("lang.switchLabel")}
>
  <Button
    href="/api/locale?locale=id&redirect={redirectPath}"
    variant="ghost"
    size="sm"
    class={cn("h-7 px-2 text-[8px]", locale === "id" && "pixel-nav-active")}
    aria-current={locale === "id" ? "true" : undefined}
  >
    {t("lang.id")}
  </Button>
  <Button
    href="/api/locale?locale=en&redirect={redirectPath}"
    variant="ghost"
    size="sm"
    class={cn("h-7 px-2 text-[8px]", locale === "en" && "pixel-nav-active")}
    aria-current={locale === "en" ? "true" : undefined}
  >
    {t("lang.en")}
  </Button>
</div>