import { SVGProps } from "react";

export interface ISVGType extends SVGProps<SVGSVGElement> {
    size?: number | string;
}