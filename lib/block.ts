/*
 * Copyright (c) 2013-2021 node-coap contributors.
 *
 * node-coap is licensed under an MIT +no-false-attribs license.
 * All rights not explicitly granted in the MIT license are reserved.
 * See the included LICENSE file for more details.
 */

import { Block } from '../models/models'

const TwoPowTwenty = 1048575

/**
 *
 * @param numOrBlockState The block sequence number or a block state object.
 * @param more Can indicate if more blocks are to follow.
 * @param size The block size.
 */
export function generateBlockOption (numOrBlockState: Block | number, more?: number, size?: number): Buffer {
    let num
    if (typeof numOrBlockState === 'object') {
        num = numOrBlockState.num
        more = numOrBlockState.more
        size = numOrBlockState.size
    } else {
        num = numOrBlockState
    }

    if (num == null || more == null || size == null) {
        throw new Error('Invalid parameters')
    }

    if (num > TwoPowTwenty) {
        throw new Error('Sequence number out of range')
    }

    let buff = Buffer.alloc(4)

    const value = (num << 4) | (more << 3) | (size & 7)
    buff.writeInt32BE(value)

    if (num >= 4096) {
        buff = buff.slice(1, 4)
    } else if (num >= 16) {
        buff = buff.slice(2, 4)
    } else {
        buff = buff.slice(3, 4)
    }

    return buff
}

export function parseBlockOption (buff: Buffer): Block {
    if (buff.length === 1) {
        buff = Buffer.concat([Buffer.alloc(3), buff])
    } else if (buff.length === 2) {
        buff = Buffer.concat([Buffer.alloc(2), buff])
    } else if (buff.length === 3) {
        buff = Buffer.concat([Buffer.alloc(1), buff])
    } else {
        throw new Error(`Invalid block option buffer length. Must be 1, 2 or 3. It is ${buff.length}`)
    }

    const value = buff.readInt32BE()

    const num = (value >> 4) & TwoPowTwenty
    const more = (value & 8) === 8 ? 1 : 0
    const size = value & 7

    return {
        num,
        more,
        size
    }
}

export function exponentToByteSize (expo: number): number {
    return Math.pow(2, expo + 4)
}

export function byteSizeToExponent (byteSize: number): number {
    return Math.round(Math.log(byteSize) / Math.log(2) - 4)
}
