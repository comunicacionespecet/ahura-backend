from azure.storage.blob import BlobServiceClient, ContentSettings
from .config import AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER


class AzureBlobService:
    def __init__(self):
        self.client = BlobServiceClient.from_connection_string(
            AZURE_STORAGE_CONNECTION_STRING)
        self.container = self.client.get_container_client(
            AZURE_STORAGE_CONTAINER)

    def upload_blob(self, blob_name, data, content_type="application/pdf"):
        self.container.upload_blob(
            name=blob_name,
            data=data,
            overwrite=True,
            content_settings=ContentSettings(
                content_type=content_type,
                content_disposition="inline"
            )
        )

    def download_blob(self, blob_name):
        blob_client = self.container.get_blob_client(blob_name)
        downloader = blob_client.download_blob()
        return downloader.readall()

    def list_blobs(self, prefix=None):
        return [blob.name for blob in self.container.list_blobs(name_starts_with=prefix)]

    def count_blobs(self, prefix=None):
        return len(list(self.container.list_blobs(name_starts_with=prefix)))

    def get_latest_blobs(self, count=3, prefix=None):
        """
        Retorna los 'count' blobs más recientes, ordenados por fecha de modificación.
        """
        blobs = list(self.container.list_blobs(name_starts_with=prefix))
        blobs.sort(key=lambda b: b.last_modified, reverse=True)
        return blobs[:count]

    def delete_blob(self, blob_name):
        self.container.delete_blob(blob_name)


if __name__ == "__main__":
    # Instancia el servicio
    service = AzureBlobService()

    # Listar todos los blobs
    print("Lista de blobs:")
    for name in service.list_blobs():
        print("-", name)

    # Contar blobs
    total = service.count_blobs()
    print(f"\nTotal de blobs: {total}")

    # Obtener los 3 blobs más recientes
    print("\nBlobs más recientes:")
    latest = service.get_latest_blobs()
    for blob in latest:
        print(f"- {blob.name} (modificado: {blob.last_modified})")