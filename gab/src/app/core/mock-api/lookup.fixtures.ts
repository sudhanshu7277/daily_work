import { Client, Country, Deal, Region, User } from '../models';

export const MOCK_REGIONS: Region[] = [
  { id: 'r-latam', name: 'LATAM', code: 'LATAM' },
  { id: 'r-nam',   name: 'NAM',   code: 'NAM' },
  { id: 'r-emea',  name: 'EMEA',  code: 'EMEA' },
  { id: 'r-apac',  name: 'APAC',  code: 'APAC' },
];

export const MOCK_COUNTRIES: Country[] = [
  { id: 'c-arg', name: 'ARGENTINA',     code: 'ARG', regionId: 'r-latam' },
  { id: 'c-bra', name: 'BRAZIL',        code: 'BRA', regionId: 'r-latam' },
  { id: 'c-mex', name: 'MEXICO',        code: 'MEX', regionId: 'r-latam' },
  { id: 'c-chl', name: 'CHILE',         code: 'CHL', regionId: 'r-latam' },
  { id: 'c-col', name: 'COLOMBIA',      code: 'COL', regionId: 'r-latam' },
  { id: 'c-usa', name: 'UNITED STATES', code: 'USA', regionId: 'r-nam' },
  { id: 'c-can', name: 'CANADA',        code: 'CAN', regionId: 'r-nam' },
  { id: 'c-gbr', name: 'UNITED KINGDOM',code: 'GBR', regionId: 'r-emea' },
  { id: 'c-deu', name: 'GERMANY',       code: 'DEU', regionId: 'r-emea' },
  { id: 'c-fra', name: 'FRANCE',        code: 'FRA', regionId: 'r-emea' },
  { id: 'c-jpn', name: 'JAPAN',         code: 'JPN', regionId: 'r-apac' },
  { id: 'c-sgp', name: 'SINGAPORE',     code: 'SGP', regionId: 'r-apac' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'cl-msu',       name: 'MSU ENERGY SA',                          countryId: 'c-arg' },
  { id: 'cl-camori',    name: 'CAMORIM SERVIÇOS MARITIMOS LTD',          countryId: 'c-bra' },
  { id: 'cl-petromex',  name: 'PETROMEX HOLDINGS',                       countryId: 'c-mex' },
  { id: 'cl-andes',     name: 'ANDES CAPITAL PARTNERS',                  countryId: 'c-chl' },
  { id: 'cl-bogcap',    name: 'BOGOTA CAPITAL ADVISORY',                 countryId: 'c-col' },
  { id: 'cl-sigma',     name: 'SIGMA WEALTH MANAGEMENT',                 countryId: 'c-usa' },
  { id: 'cl-northstar', name: 'NORTHSTAR PRIVATE BANKING',               countryId: 'c-can' },
  { id: 'cl-thames',    name: 'THAMES FAMILY OFFICE',                    countryId: 'c-gbr' },
];

export const MOCK_DEALS: Deal[] = [
  { id: 'd-msu-1',  name: 'MSU Bono Privado Fideicomiso (ARG3000018)', clientId: 'cl-msu' },
  { id: 'd-msu-2',  name: 'MSU Series II Notes (ARG3000022)',           clientId: 'cl-msu' },
  { id: 'd-cam-1',  name: 'Camorim Maritime Trust (BRA0000759)',        clientId: 'cl-camori' },
  { id: 'd-pmx-1',  name: 'Petromex Bridge Facility (MEX0001102)',      clientId: 'cl-petromex' },
  { id: 'd-and-1',  name: 'Andes Equity Fund III',                       clientId: 'cl-andes' },
  { id: 'd-bog-1',  name: 'Bogota Sovereign Wealth Mandate',             clientId: 'cl-bogcap' },
  { id: 'd-sig-1',  name: 'Sigma Discretionary Portfolio',               clientId: 'cl-sigma' },
  { id: 'd-nor-1',  name: 'Northstar Trust 2024-A',                      clientId: 'cl-northstar' },
  { id: 'd-tha-1',  name: 'Thames Multi-Asset Mandate',                  clientId: 'cl-thames' },
];

export const MOCK_USERS: User[] = [
  { id: 'u-001', name: 'Swathi Iharra',     email: 'swathi.iharra@example.com',     role: 'maker' },
  { id: 'u-002', name: 'Cliver Scaria',     email: 'cliver.scaria@example.com',     role: 'maker' },
  { id: 'u-003', name: 'Ravi Kumar',        email: 'ravi.kumar@example.com',        role: 'checker' },
  { id: 'u-004', name: 'Maria Gonzales',    email: 'maria.gonzales@example.com',    role: 'checker' },
  { id: 'u-005', name: 'Venkata Rajeev Raju', email: 'rajeev.raju@example.com',     role: 'signature-validator' },
  { id: 'u-006', name: 'Daniel Park',       email: 'daniel.park@example.com',       role: 'operations' },
  { id: 'u-007', name: 'Priya Sharma',      email: 'priya.sharma@example.com',      role: 'operations' },
  { id: 'u-008', name: 'Admin User',        email: 'admin@example.com',             role: 'admin' },
];
