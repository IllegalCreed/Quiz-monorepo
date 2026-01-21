import CheckRadio from "../components/CheckRadio.vue";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";

export default {
  title: "Components/CheckRadio",
  component: CheckRadioGroup,
};

// Standalone: not selected
export const StandaloneUnselected = () => ({
  components: { CheckRadio },
  template: `<div style="padding:12px"><CheckRadio value="a" label="Option A"/></div>`,
});

// Standalone: correct
export const StandaloneCorrect = () => ({
  components: { CheckRadio },
  template: `<div style="padding:12px"><CheckRadio value="a" label="Correct" status="correct"/></div>`,
});

// Standalone: incorrect
export const StandaloneIncorrect = () => ({
  components: { CheckRadio },
  template: `<div style="padding:12px"><CheckRadio value="a" label="Incorrect" status="incorrect"/></div>`,
});

// Group: no selection (4 options)
export const GroupUnselected = () => ({
  components: { CheckRadio, CheckRadioGroup },
  template: `<CheckRadioGroup v-model="v" :correctValue="'b'"><CheckRadio value="a" label="A"/><CheckRadio value="b" label="B"/><CheckRadio value="c" label="C"/><CheckRadio value="d" label="D"/></CheckRadioGroup>`,
  data() {
    return { v: null };
  },
});

// Group: selected correct (4 options)
export const GroupSelectedCorrect = () => ({
  components: { CheckRadio, CheckRadioGroup },
  template: `<CheckRadioGroup v-model="v" :correctValue="'b'"><CheckRadio value="a" label="A"/><CheckRadio value="b" label="B"/><CheckRadio value="c" label="C"/><CheckRadio value="d" label="D"/></CheckRadioGroup>`,
  data() {
    return { v: "b" };
  },
});

// Group: selected incorrect (user chose A, correct is B) (4 options)
export const GroupSelectedIncorrect = () => ({
  components: { CheckRadio, CheckRadioGroup },
  template: `<CheckRadioGroup v-model="v" :correctValue="'b'"><CheckRadio value="a" label="A"/><CheckRadio value="b" label="B"/><CheckRadio value="c" label="C"/><CheckRadio value="d" label="D"/></CheckRadioGroup>`,
  data() {
    return { v: "a" };
  },
});
