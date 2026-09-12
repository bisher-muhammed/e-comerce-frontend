"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import apiPublic from "@/app/lib/api/apiPublic";
import {
  verifyOtpSchema,
  type VerifyOtpInput,
} from "../../validations/customer/auth.validation";

const OTP_EXPIRY_SECONDS = 120;

export default function VerifyOtpPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(
    OTP_EXPIRY_SECONDS
  );

  const [expiresAt, setExpiresAt] = useState(
    () => Date.now() + OTP_EXPIRY_SECONDS * 1000
  );

  const [isResending, setIsResending] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onSubmit",
    defaultValues: {
      otp: "",
    },
  });

  /*
   * OTP countdown
   *
   * The countdown is based on an actual expiry timestamp.
   * We don't recreate the interval every second.
   */
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((expiresAt - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);

      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Update immediately
    updateCountdown();

    // Clear any previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start one timer
    timerRef.current = setInterval(
      updateCountdown,
      1000
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [expiresAt]);

  /*
   * Format countdown
   *
   * 120 -> 02:00
   * 75  -> 01:15
   * 5   -> 00:05
   */
  const minutes = Math.floor(
    remainingSeconds / 60
  );

  const seconds = remainingSeconds % 60;

  const formattedTime = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  /*
   * Verify OTP
   */
  const onSubmit = async (data: VerifyOtpInput) => {
    setServerError(null);

    try {
      await apiPublic.post(
        "/auth/verify-otp",
        {
          otp: data.otp,
        }
      );

      // Registration completed
      router.push("/auth/login");
    } catch (error: any) {
      console.error(
        "OTP verification failed:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Unable to verify the code.";

      setServerError(message);
    }
  };

  /*
   * Resend OTP
   */
  const handleResend = async () => {
    /*
     * Do not allow resend before countdown finishes.
     */
    if (
      remainingSeconds > 0 ||
      isResending
    ) {
      return;
    }

    setServerError(null);
    setIsResending(true);

    try {
      await apiPublic.post("/auth/resend-otp");

      /*
       * Clear old OTP
       */
      reset();

      /*
       * Start a fresh 2-minute countdown.
       *
       * Backend creates a new OTP with:
       * EX: 120
       */
      setExpiresAt(
        Date.now() + OTP_EXPIRY_SECONDS * 1000
      );

      setRemainingSeconds(
        OTP_EXPIRY_SECONDS
      );
    } catch (error: any) {
      console.error(
        "Resend OTP failed:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Unable to resend verification code.";

      setServerError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main
      className="
        min-h-screen
        bg-background
        px-4
        py-8
        sm:px-6
        sm:py-10
        lg:py-12

        max-[900px]:py-6
        min-[901px]:max-[1200px]:py-6
        min-[1201px]:max-[1400px]:py-6
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-md
        "
      >

        {/* Header */}

        <div
          className="
            mb-6
            text-center
            sm:mb-7

            max-[900px]:mb-5
            min-[901px]:max-[1200px]:mb-5
            min-[1201px]:max-[1400px]:mb-5
          "
        >
          <Link
            href="/"
            className="
              text-xl
              font-semibold
              tracking-tight
            "
          >
            STORE.
          </Link>

          <h1
            className="
              mt-5
              text-2xl
              font-medium
              tracking-tight
              sm:mt-6
              sm:text-3xl

              max-[900px]:mt-4
              min-[901px]:max-[1200px]:mt-4
              min-[1201px]:max-[1400px]:mt-4
            "
          >
            Verify your email
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Enter the 6-digit verification
            code we sent to your email.
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
            space-y-4

            max-[900px]:space-y-3
            min-[901px]:max-[1200px]:space-y-3
            min-[1201px]:max-[1400px]:space-y-3
          "
        >

          {/* OTP */}

          <div>
            <label
              htmlFor="otp"
              className="
                mb-1.5
                block
                text-sm
                font-medium
              "
            >
              Verification code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              {...register("otp")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-4
                text-center
                text-xl
                tracking-[0.5em]
                outline-none
                transition
                focus:border-foreground
                sm:h-12
              "
            />

            {errors.otp && (
              <p
                className="
                  mt-1.5
                  text-sm
                  text-destructive
                "
              >
                {errors.otp.message}
              </p>
            )}
          </div>

          {/* Server Error */}

          {serverError && (
            <p
              className="
                text-center
                text-sm
                text-destructive
              "
            >
              {serverError}
            </p>
          )}

          {/* Verify Button */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              h-11
              w-full
              bg-primary
              text-sm
              font-medium
              text-primary-foreground
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:h-12
            "
          >
            {isSubmitting
              ? "Verifying..."
              : "Verify email"}
          </button>
        </form>

        {/* Resend */}

        <div
          className="
            mt-6
            text-center

            max-[900px]:mt-4
            min-[901px]:max-[1200px]:mt-4
            min-[1201px]:max-[1400px]:mt-4
          "
        >

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Didn't receive the code?
          </p>

          {remainingSeconds > 0 ? (
            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              You can resend the code in{" "}
              <span
                className="
                  font-medium
                  text-foreground
                "
              >
                {formattedTime}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="
                mt-2
                text-sm
                font-medium
                text-foreground
                underline
                underline-offset-4
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isResending
                ? "Sending..."
                : "Resend code"}
            </button>
          )}
        </div>

        {/* Back */}

        <p
          className="
            mt-6
            text-center
            text-sm
            text-muted-foreground

            max-[900px]:mt-4
            min-[901px]:max-[1200px]:mt-4
            min-[1201px]:max-[1400px]:mt-4
          "
        >
          <Link
            href="/auth/register"
            className="
              font-medium
              text-foreground
              underline
              underline-offset-4
            "
          >
            Back to registration
          </Link>
        </p>
      </div>
    </main>
  );
}