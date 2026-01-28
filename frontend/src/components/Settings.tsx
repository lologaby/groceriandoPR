import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Key, Database, ExternalLink, CheckCircle, Info } from 'lucide-react';
import { NOTION_CONFIG_KEY, type NotionConfig } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

const NOTION_INTEGRATIONS_URL = 'https://www.notion.so/my-integrations';

export function Settings() {
  const [notionApiKey, setNotionApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTION_CONFIG_KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as NotionConfig;
      if (v?.notionApiKey) setNotionApiKey(v.notionApiKey);
      if (v?.databaseId) setDatabaseId(v.databaseId);
      setSaved(!!(v?.notionApiKey && v?.databaseId));
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    const key = notionApiKey.trim();
    const id = databaseId.trim();
    if (!key || !id) {
      toast.error('Campos requeridos', {
        description: 'API Key y Database ID son necesarios',
      });
      return;
    }
    try {
      localStorage.setItem(
        NOTION_CONFIG_KEY,
        JSON.stringify({ notionApiKey: key, databaseId: id } satisfies NotionConfig)
      );
      setSaved(true);
      toast.success('Configuración guardada', {
        description: 'Tu información se guardó localmente en este navegador',
      });
    } catch {
      toast.error('Error al guardar', {
        description: 'No se pudo guardar la configuración',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3"
        >
          Conectar con Notion
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-neutral-600 dark:text-neutral-400"
        >
          Guarda tu lista de compras directamente en una base de datos de Notion
        </motion.p>
      </div>

      {/* Status Badge */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="p-4 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
              <div>
                <p className="font-medium text-success-900 dark:text-success-100">
                  Configuración activa
                </p>
                <p className="text-sm text-success-700 dark:text-success-300">
                  Los datos se guardan localmente en este navegador
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <Input
              type="password"
              label="Notion API Key"
              placeholder="secret_..."
              value={notionApiKey}
              onChange={(e) => setNotionApiKey(e.target.value)}
              leftIcon={<Key className="w-5 h-5" />}
            />

            <Input
              type="text"
              label="Database ID"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              leftIcon={<Database className="w-5 h-5" />}
              className="font-mono text-sm"
            />

            <Button variant="primary" size="lg" onClick={save} className="w-full">
              Guardar configuración
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-1">
                Cómo obtener tu API Key y Database ID
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Sigue estos pasos para configurar la integración con Notion
              </p>
            </div>
          </div>

          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <Badge variant="primary" className="flex-shrink-0">
                1
              </Badge>
              <div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Ve a{' '}
                  <a
                    href={NOTION_INTEGRATIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    notion.so/my-integrations
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <Badge variant="primary" className="flex-shrink-0">
                2
              </Badge>
              <p className="text-neutral-700 dark:text-neutral-300">
                Crea una nueva integración (Internal) y dale un nombre
              </p>
            </li>

            <li className="flex gap-3">
              <Badge variant="primary" className="flex-shrink-0">
                3
              </Badge>
              <p className="text-neutral-700 dark:text-neutral-300">
                Copia el "Internal Integration Token" y pégalo arriba como API Key
              </p>
            </li>

            <li className="flex gap-3">
              <Badge variant="primary" className="flex-shrink-0">
                4
              </Badge>
              <p className="text-neutral-700 dark:text-neutral-300">
                Crea una base de datos en Notion (tipo "🛒 Lista de Compras") y compártela con tu
                integración (⋯ → Conectar con → tu integración)
              </p>
            </li>

            <li className="flex gap-3">
              <Badge variant="primary" className="flex-shrink-0">
                5
              </Badge>
              <div>
                <p className="text-neutral-700 dark:text-neutral-300 mb-2">
                  Copia el ID de la base de datos desde la URL:
                </p>
                <code className="block p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono break-all">
                  https://notion.so/workspace/
                  <span className="text-primary-600 font-bold">abc123...</span>?v=...
                </code>
                <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-2">
                  El Database ID es la parte resaltada (entre workspace/ y ?v=)
                </p>
              </div>
            </li>
          </ol>
        </Card>
      </motion.div>
    </div>
  );
}
