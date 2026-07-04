<script lang="ts">
  import { onMount } from "svelte";

  type Props = {
    scriptUrl: string;
    websiteId: string;
  };

  let { scriptUrl, websiteId }: Props = $props();

  onMount(() => {
    const load = (): void => {
      if (document.querySelector('script[data-umami-loader="1"]')) {
        return;
      }

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.defer = true;
      script.dataset.websiteId = websiteId;
      script.dataset.umamiLoader = "1";
      document.head.appendChild(script);
    };

    const schedule =
      "requestIdleCallback" in globalThis
        ? (fn: () => void) =>
            globalThis.requestIdleCallback(fn, { timeout: 4000 })
        : (fn: () => void) => globalThis.setTimeout(fn, 1500);

    schedule(load);
  });
</script>