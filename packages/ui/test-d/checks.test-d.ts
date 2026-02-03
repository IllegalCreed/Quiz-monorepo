import { expectAssignable } from "tsd";
import type {
  CheckRadioProps,
  CheckRadioSelectPayload,
  Option,
} from "../dist/index.d.ts";

// Props shape
expectAssignable<CheckRadioProps>({ value: "a" });
expectAssignable<CheckRadioSelectPayload>("a");

// Option type
expectAssignable<Option>({ value: "a" });
