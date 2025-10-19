import { writable } from "svelte/store";
import { persisted } from "svelte-persisted-store";

export const tayToIpccTemp = writable([])
export const  tayToIpccStore = persisted('tayToIpcc', tayToIpccTemp)