// Probably not describe all the fields. Only the ones we need.
export interface GoogleProfile {
  id: string;
  emails: Array<{ value: string }>;
  name: {
    givenName: string;
    familyName: string;
  };
}
