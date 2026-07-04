<script lang="ts">
  import "../app.css";

  import { onNavigate } from "$app/navigation";
  import { getTransitionType } from "$lib/navigation/transitions";

  let { children } = $props();

  onNavigate((navigation) => {
    const startViewTransition = document.startViewTransition;
    if (!startViewTransition) {
      return;
    }

    const from =
      navigation.from?.url ?? new URL(navigation.to?.url ?? window.location.href);
    const to = navigation.to?.url;

    if (!to) {
      return;
    }

    const transitionType = getTransitionType(from, to);
    document.documentElement.dataset.transition = transitionType;

    return new Promise<void>((resolve) => {
      const transition = startViewTransition.call(document, async () => {
        resolve();
        await navigation.complete;
      });

      transition.finished.finally(() => {
        delete document.documentElement.dataset.transition;
      });
    });
  });
</script>

<div class="mx-auto w-full max-w-[720px] px-4">
  {@render children()}
</div>