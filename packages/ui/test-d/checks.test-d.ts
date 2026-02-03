import { expectAssignable } from "tsd";
import type { CheckRadioProps, CheckRadioGroupProps } from "../dist/index.d.ts";

// Check that CheckRadio props are assignable
expectAssignable<CheckRadioProps>({ value: "a" });
expectAssignable<CheckRadioProps>({ value: "a", status: "correct" });

// CheckRadioGroup props
expectAssignable<CheckRadioGroupProps>({ options: [{ value: "a" }] });
