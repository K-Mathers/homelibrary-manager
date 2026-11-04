import { ISVGType } from "@/shared/types/types";

export const CatalogSVG = ({ width = "18", height = "18" }: ISVGType) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.25 2.25V15.75M5.25 2.25H3C2.58579 2.25 2.25 2.58579 2.25 3V15C2.25 15.4142 2.58579 15.75 3 15.75H5.25M5.25 2.25H7.5C7.91421 2.25 8.25 2.58579 8.25 3V15C8.25 15.4142 7.91421 15.75 7.5 15.75H5.25M15.2998 14.1748C15.4498 14.5498 15.2248 14.9998 14.8498 15.1498L13.4248 15.6748C13.0498 15.8248 12.5998 15.5998 12.4498 15.2248L8.32482 3.82482C8.17482 3.44982 8.39982 2.99982 8.77482 2.84982L10.1998 2.32482C10.5748 2.17482 11.0248 2.39982 11.1748 2.77482L15.2998 14.1748Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        stroke="currentColor"
      />
    </svg>
  );
};
