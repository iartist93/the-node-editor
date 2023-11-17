import {ref, type Ref} from "vue";

interface useCanvasType {
    canvas: Ref<HTMLCanvasElement | null>;
    ctx: Ref<CanvasRenderingContext2D | null>;
    renderEditor : () => void
}

export const useCanvas = (): useCanvasType => {
    const canvas: Ref<HTMLCanvasElement | null> = ref(null);
    const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

    /**
     * Editor initialization and draw the editor background.
     */
    const renderEditor = () => {
        if (!ctx.value || !canvas.value) return;

        setCanvasSize();

        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        ctx.value.fillStyle = "#24232c";
        ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
    }

    /**
     * Set the canvas size
     * Currently it fill the whole screen
     */
    const setCanvasSize = () => {
        if (!canvas.value) {
            console.error("You should init the canvas object first");
            return;
        }
        canvas.value.width = document.body.clientWidth;
        canvas.value.height = document.body.clientHeight;
    }


    return {
        canvas,
        ctx,
        renderEditor,
    }
}