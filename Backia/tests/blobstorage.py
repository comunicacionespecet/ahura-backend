from azure_blob.blob_service import AzureBlobService


def main():
    service = AzureBlobService()
    blob_name = "TesispregradoDIDIERTIRADO2013.pdf"
    file_path = "TesispregradoDIDIERTIRADO2013.pdf"

    # Leer el archivo en modo binario
    with open(file_path, "rb") as f:
        data = f.read()

    # Subir el blob
    service.upload_blob(blob_name, data)
    print(f"Subido: {blob_name}")

    # Listar blobs
    blobs = service.list_blobs()
    print("Blobs en el contenedor:", blobs)

    # Descargar el blob
    contenido = service.download_blob(blob_name)
    print(f"Descargado {blob_name}, tamaño: {len(contenido)} bytes")

    # Eliminar el blob
    # service.delete_blob(blob_name)
    # print(f"Eliminado: {blob_name}")


if __name__ == "__main__":
    main()
