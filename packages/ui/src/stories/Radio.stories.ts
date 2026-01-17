import Radio from "../components/Radio.vue";
import RadioGroup from "../components/RadioGroup.vue";

export default {
  title: "Components/Radio",
  component: RadioGroup,
};

export const Default = () => ({
  components: { Radio, RadioGroup },
  template: `<RadioGroup v-model="v"><Radio value="a" label="Option A"/><Radio value="b" label="Option B"/></RadioGroup>`,
  data() {
    return { v: "a" };
  },
});

export const WithDescription = () => ({
  components: { Radio, RadioGroup },
  template: `<RadioGroup v-model="v"><Radio value="a" label="Option A" description="Extra info"/><Radio value="b" label="Option B"/></RadioGroup>`,
  data() {
    return { v: null };
  },
});

export const Disabled = () => ({
  components: { Radio, RadioGroup },
  template: `<RadioGroup v-model="v" :disabled="true"><Radio value="a" label="Option A"/><Radio value="b" label="Option B"/></RadioGroup>`,
  data() {
    return { v: null };
  },
});

export const Invalid = () => ({
  components: { Radio, RadioGroup },
  template: `<RadioGroup v-model="v"><Radio value="a" label="Option A" invalid/><Radio value="b" label="Option B"/></RadioGroup>`,
  data() {
    return { v: null };
  },
});
