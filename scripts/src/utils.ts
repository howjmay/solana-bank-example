import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import yaml from 'yaml';
import {Keypair} from '@solana/web3.js';

/**
 * @private
 */
async function get_config(): Promise<any> {
  // Path to Solana CLI config file
  const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
  );
  const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
  return yaml.parse(configYml);
}

/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export async function get_rpc_url(): Promise<string> {
  try {
    const config = await get_config();
    if (!config.json_rpc_url) throw new Error('Missing RPC URL');
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      'Failed to read RPC url from CLI config file, falling back to localhost',
    );
    return 'http://localhost:8899';
  }
}

/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export async function get_payer(): Promise<Keypair> {
  try {
    const config = await get_config();
    if (!config.keypair_path) throw new Error('Missing keypair path');
    return await create_keypair_from_file(config.keypair_path);
  } catch (err) {
    console.warn(
      'Failed to create keypair from CLI config file, falling back to new random keypair',
    );
    return Keypair.generate();
  }
}

/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export async function create_keypair_from_file(
  filePath: string,
): Promise<Keypair> {
  const secret_key_string = await fs.readFile(filePath, {encoding: 'utf8'});
  const secret_key = Uint8Array.from(JSON.parse(secret_key_string));
  return Keypair.fromSecretKey(secret_key);
}
