export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/40">
    <div className="container py-12 grid gap-8 md:grid-cols-3">
      <div>
        <p className="font-display text-xl">Auréa Atelier</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Peças autorais em tecidos nobres, produzidas em pequena escala no Brasil.
        </p>
      </div>
      <div className="text-sm space-y-2">
        <p className="eyebrow mb-3">Atelier</p>
        <p className="text-muted-foreground">Atendimento sob hora marcada</p>
        <p className="text-muted-foreground">Rua das Araucárias Douradas, 142 — Curitiba</p>
      </div>
      <div className="text-sm space-y-2">
        <p className="eyebrow mb-3">Contato</p>
        <p className="text-muted-foreground">contato@aureaatelier.com</p>
        <p className="text-muted-foreground">+55 41 99872-3146</p>
      </div>
    </div>
    <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Auréa Atelier. Todos os direitos reservados.
    </div>
  </footer>
);