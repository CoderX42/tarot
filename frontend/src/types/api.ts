export type DrawnCardResponse = {
  id: number
  upright: boolean
  name: string
  name_en: string
  keywords: string[]
  hue: number
}

export type PerCardReading = {
  id: number
  name: string
  name_en: string
  upright: boolean
  orientation: string
  interpretation: string
  keywords: string[]
  hue: number
}

export type DrawResponse = {
  question: string
  cards: DrawnCardResponse[]
  per_card: PerCardReading[]
  synthesis: string
  title: string
}
