import { defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { ReactiveVar } from 'meteor/reactive-var';
import { Blaze } from 'meteor/blaze';

const VBlaze = defineComponent({
  props: {
    template: {
      type: String,
      required: true
    },

    data: {
      type: [Object, Function],
      default: () => ({})
    }
  },

  setup(props) {
    const el = ref<HTMLDivElement>();
    let blazeView: Blaze.View;

    const meteorData = new ReactiveVar(props.data);
    watch(
      () => props.data,
      (data) => {
        meteorData.set(data);
      }
    );

    function createView() {
      // @ts-expect-error private api
      const template = Blaze._getTemplate(props.template, null);
      if (!template) {
        throw new Error(`Blaze template '${props.template}' not found.`);
      }
      destroyView();
      blazeView = Blaze.renderWithData(
        template,
        () => meteorData.get(),
        el.value!
      );
    }

    function destroyView() {
      if (blazeView) {
        Blaze.remove(blazeView);
      }
    }

    onMounted(() => {
      createView();

      watch(
        () => props.template,
        () => {
          createView();
        }
      );
    });

    onUnmounted(() => {
      destroyView();
    });

    return {
      el
    };
  },

  render() {
    return h('div', {
      ref: 'el'
    });
  } 
});

export default VBlaze;
