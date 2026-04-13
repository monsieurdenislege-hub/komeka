import { notFound } from 'next/navigation'
import EssayViewerClient from './EssayViewerClient'

// Mode démo : essay stocké en localStorage côté client
interface Props {
  params: Promise<{ id: string }>
}

export default async function EssayViewerPage({ params }: Props) {
  const { id } = await params

  // En mode démo, les données viennent du client (localStorage)
  // On passe l'id au client qui récupère l'essay
  if (!id) notFound()

  return <EssayViewerClient essayId={id} />
}
