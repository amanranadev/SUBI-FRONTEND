import { type CSSProperties } from "react";
import { SubiTextLogo } from "./subi-text-logo";

export const SubiLoading = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        <div
          aria-label="Loading"
          role="img"
          className="inline-block leading-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 318.14 322.19"
            className="h-24 w-24 animate-bounce"
            style={{ animationDuration: "1s" }}
          >
            <style>{`
            @keyframes subi-blink {
              0%, 8%, 100% { transform: scaleY(1) }
              4% { transform: scaleY(0.1) }
            }
            @keyframes subi-puff {
              0% { transform: translateY(0) scale(0.6); opacity: 0 }
              10% { opacity: 1 }
              100% { transform: translateY(-60px) scale(1.4); opacity: 0 }
            }
            @keyframes subi-chimney {
              0%, 100% { transform: translateY(0) }
              50% { transform: translateY(-2px) }
            }
            @keyframes subi-smoke-path {
              0%, 100% { opacity: 0.8; transform: scale(1) }
              50% { opacity: 1; transform: scale(1.05) }
            }
            .subi-eye {
              transform-origin: center;
              transform-box: fill-box;
              animation: subi-blink 2s linear infinite;
            }
            .subi-smoke {
              animation: subi-puff 1.2s ease-in-out infinite;
              animation-delay: var(--d, 0s);
            }
            .subi-chimney {
              animation: subi-chimney 2s ease-in-out infinite;
            }
            .subi-smoke-path {
              animation: subi-smoke-path 1.5s ease-in-out infinite;
            }
          `}</style>

            <g>
              <path
                d="M162.14,110.19h75.5l80.5,77.5v134.5H39.14v-134.5l78-76v-29.5c14.44.63,31.53-4.25,45,1.5v26.5ZM150.14,143.19v-48.5l-1.5-1.5h-18l-1.5,1.5v48.5h21ZM162.14,311.19h143.5l1.5-1.5v-115l-72.68-69.36-6.34,4.34-65.99,63.01v118.5ZM150.14,196.19H50.14v115h100v-115Z"
                fill="hsl(var(--sb))"
              />
              <path
                className="subi-smoke-path"
                d="M.14,139.69c.46-4.78,2.48-12.18,4.24-16.76,1.17-3.04,6.63-11.17,6.79-12.29.39-2.74-2.52-9.38-2.91-13.07-1.41-13.58,4.01-30.27,13.84-39.91,3.06-3.01,12.38-7.65,14.08-10.18,2.03-3.03,2.89-12,4.95-16.79C50.26,9.44,76.42-1.69,98.63.21c33.82,2.89,47.21,37,46.52,66.99l-11.57-.94c-.06-20.94-6.94-47.24-29.78-53.22-21.26-5.56-46.59,5.59-53.65,27.15,18.48-4.82,47.76-3.66,44.99,22.51-1.86,17.61-29.26,21.91-42.67,16.67-9.32-3.64-12.02-9.46-15.83-18.15-6.96,5.8-13.77,12.76-16.05,21.94-.85,3.43-1.6,15.39.01,18.08,1.34,2.22,5.25-1.21,7.3-1.76,11.01-2.96,30.94-4.83,35.46,9,6.69,20.46-16.01,26.14-31.45,21.45-5.56-1.69-9.3-6.2-14.77-7.72-.58.43-5.01,12.73-5.01,13.5v18.5H.14c.32-4.7-.44-9.87,0-14.5ZM48.27,54.32c-1.13,1.81,2.3,9.72,3.85,11.39,8.52,9.17,36.46,2.74,31.27-9.26-4.74-10.98-26.77-6.83-35.13-2.13ZM27.15,112.2c-2.22,2.95,12.16,7.9,14.53,8.03,3.45.19,10.98-1.55,11.32-5.72-5.59-10.45-17.22-4.97-25.84-2.31Z"
                fill="hsl(var(--sb))"
              />
              <path
                d="M198.83,249.31l1.31.32c15.28,26.12,52.16,25.18,68.64.62l10.34,5.44c-20.35,33.06-70.84,33.23-89.96-1l9.67-5.38Z"
                fill="hsl(var(--sb))"
              />
              <path
                className="subi-eye"
                d="M209.88,212.42c16.96-3.46,15.33,23.69-1.79,18.32-7.08-2.22-7.55-16.42,1.79-18.32Z"
                fill="hsl(var(--sb))"
              />
              <path
                className="subi-eye"
                d="M262.83,214.51c8.63,7.89-3.49,23.59-13.21,14.71-9.97-9.11,3.59-23.51,13.21-14.71Z"
                fill="hsl(var(--sb))"
                style={{ animationDelay: "1.2s" }}
              />
            </g>

            <g transform="translate(236, 100)" className="subi-chimney">
              <circle
                className="subi-smoke"
                r="6"
                fill="hsl(var(--rf-gray-300))"
                style={{ "--d": "0s" } as CSSProperties}
              />
              <circle
                className="subi-smoke"
                r="8"
                fill="hsl(var(--rf-gray-200))"
                style={{ "--d": ".35s" } as CSSProperties}
              />
              <circle
                className="subi-smoke"
                r="7"
                fill="hsl(var(--rf-gray-100))"
                style={{ "--d": ".7s" } as CSSProperties}
              />
            </g>
          </svg>
        </div>
        <div className="absolute left-0 right-0 top-full -translate-x-1/2 animate-bounce text-center font-semibold text-sb">
          <SubiTextLogo />
        </div>
      </div>
    </div>
  );
};
