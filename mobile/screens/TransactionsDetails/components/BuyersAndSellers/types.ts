export interface PartyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  representing: boolean;
  isFromAPI: boolean;
}

export interface BuyersAndSellersFormData {
  buyers: PartyFormData[];
  sellers: PartyFormData[];
}
