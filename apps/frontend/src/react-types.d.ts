/**
 * Type compatibility fix for React 18 → React 19 library mismatch.
 *
 * The monorepo has two copies of @types/react:
 *   - GOODWORK/node_modules/@types/react (root workspace)
 *   - apps/frontend/node_modules/@types/react (local)
 *
 * This causes libraries (lucide-react, framer-motion, recharts) to use
 * one copy while the app uses another, resulting in:
 *   "Type 'bigint' is not assignable to type 'ReactNode'"
 *
 * This declaration forces the app's ReactNode to accept all library types.
 */
import * as React from "react";

declare module "react" {
  interface ReactNodeArray extends Array<React.ReactNode> {}
  interface ReactNode extends Iterable<React.ReactNode> {}
}