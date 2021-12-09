import { RequestHandler } from 'express';
import got from 'got';
import { NPMPackage, NPMPackageFull } from './types';
var util = require('util');

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;
  try {
	const dependencies = await getPackagesRecursive(name, version);
	return res.status(200).json({ name, version, dependencies });
  } catch (error) {
    return next(error);
  }
};

async function getPackagesRecursive( name: string, version: string): Promise<NPMPackageFull[]> {

	const npmPackage: NPMPackage = await got(
		`https://registry.npmjs.org/${name}`,
	  ).json();
 	

	const dependencies = npmPackage.versions[version]?.dependencies;	
	if ( dependencies)  {
		return await Promise.all(Object.keys(dependencies)
			.map( async key => {
				const npmPackaFull: NPMPackageFull = { name: key, version:dependencies[key], dependencies: await getPackagesRecursive(key, dependencies[key].replace('^', '').replace('~', '').replace('>','').replace('<','').replace('=',''))};
				return npmPackaFull;	
			} ));
	}
	return [];
	
}

