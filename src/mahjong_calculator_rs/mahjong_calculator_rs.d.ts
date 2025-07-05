/* tslint:disable */
/* eslint-disable */
/**
 * JavaScriptから呼び出すシャンテン計算関数
 */
export function calc_shanten(tiles: Uint8Array): number;
/**
 * JavaScriptから呼び出す一般形のみのシャンテン計算
 */
export function calc_shanten_general(tiles: Uint8Array): number;
/**
 * JavaScriptから呼び出す受け入れ牌計算
 */
export function calc_acceptance(tiles: Uint8Array): AcceptanceResultJS;
/**
 * 牌のインデックスを文字列に変換
 */
export function tile_to_string(index: number): string;
/**
 * 受け入れ牌を文字列で取得
 */
export function get_acceptance_string_js(tiles: Uint8Array): string;
/**
 * WASM初期化時の起動処理
 */
export function main(): void;
/**
 * 受け入れ牌計算結果
 */
export class AcceptanceResultJS {
  private constructor();
  free(): void;
  /**
   * 現在のシャンテン数を取得
   */
  readonly current_shanten: number;
  /**
   * 受け入れ牌のインデックスリストを取得
   */
  readonly acceptance_tiles: Uint8Array;
  /**
   * 各受け入れ牌での新シャンテン数を取得
   */
  readonly acceptance_shanten: Int8Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly calc_shanten: (a: number, b: number) => number;
  readonly calc_shanten_general: (a: number, b: number) => number;
  readonly __wbg_acceptanceresultjs_free: (a: number, b: number) => void;
  readonly acceptanceresultjs_current_shanten: (a: number) => number;
  readonly acceptanceresultjs_acceptance_tiles: (a: number) => [number, number];
  readonly acceptanceresultjs_acceptance_shanten: (a: number) => [number, number];
  readonly calc_acceptance: (a: number, b: number) => number;
  readonly tile_to_string: (a: number) => [number, number];
  readonly get_acceptance_string_js: (a: number, b: number) => [number, number];
  readonly main: () => void;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
