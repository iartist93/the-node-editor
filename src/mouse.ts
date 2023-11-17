import {onBeforeUnmount, onMounted, type Ref} from "vue";
import {ref} from "vue";

interface useMouseType {
    x: Ref<number>;
    y: Ref<number>;
}

export const useMouse = (
    canvas: Ref<HTMLCanvasElement | null>,
    onMouseUp: (event: MouseEvent) => void,
    onMouseDown: (event: MouseEvent) => void,
    onMouseMove: (event: MouseEvent) => void,
    onMouseEnter: (event: MouseEvent) => void,
    onMouseLeave: (event: MouseEvent) => void
): useMouseType => {
    const x = ref(0);
    const y = ref(0);

    const onMouseDownEvent = (event: MouseEvent) => {
        x.value = event.offsetX;
        y.value = event.offsetY;
        onMouseDown(event);
    };

    const onMouseMoveEvent = (event: MouseEvent) => {
        onMouseMove(event);
    };

    const onMouseUpEvent = (event: MouseEvent) => {
        onMouseUp(event);
    };

    const onMouseEnterEvent = (event: MouseEvent) => {
        onMouseEnter(event);
    };

    const onMouseLeaveEvent = (event: MouseEvent) => {
        onMouseLeave(event);
    };

    const registerMouseEvents = () => {
        if (!canvas.value) return;
        canvas.value.addEventListener('mousedown', onMouseDownEvent);
        canvas.value.addEventListener('mousemove', onMouseMoveEvent);
        canvas.value.addEventListener('mouseup', onMouseUpEvent);
        canvas.value.addEventListener('mouseenter', onMouseEnterEvent);
        canvas.value.addEventListener('mouseleave', onMouseLeaveEvent);
    }


    const unregisterMouseEvents = () => {
        if (!canvas.value) return;
        canvas.value.removeEventListener('mousedown', onMouseDownEvent);
        canvas.value.removeEventListener('mousemove', onMouseMoveEvent);
        canvas.value.removeEventListener('mouseup', onMouseUpEvent);
        canvas.value.removeEventListener('mouseenter', onMouseEnterEvent);
        canvas.value.removeEventListener('mouseleave', onMouseLeaveEvent);
    }

    onMounted(() => {
        if (!canvas.value) {
            console.error("You should init the canvas first");
            return;
        }
        registerMouseEvents();
    })

    onBeforeUnmount(() => {
        unregisterMouseEvents();
    })

    return {
        x,
        y,
    }
}