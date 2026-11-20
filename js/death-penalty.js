/** Penalidade na experiência adquirida dentro do nível atual.
 * A experiência dos níveis concluídos não é afetada.
 * Esta operação não altera nível, pontos de atributo ou progressão desbloqueada.
 */
export const DEATH_XP_LOSS_RATE = 0.20;
export function applyDeathXpPenalty(hero) {
  if (!hero || !Number.isInteger(hero.lv) || hero.lv < 1) return {lost:0, remaining:0};
  const current = Number.isFinite(hero.xp) ? Math.max(0, Math.floor(hero.xp)) : 0;
  const lost = Math.min(current, Math.ceil(current * DEATH_XP_LOSS_RATE));
  hero.xp = current - lost;
  return {lost, remaining:hero.xp};
}
